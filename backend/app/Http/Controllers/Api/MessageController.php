<?php

namespace App\Http\Controllers\Api;

use App\Models\Message;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    public function send(Request $request)
    {
        try {
            $user = Auth::guard('api')->user();

            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $validator = Validator::make($request->all(), [
                'receiver_id' => 'required|integer|exists:users,id',
                'message'     => 'required|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $message = Message::create([
                'sender_id'   => $user->id,
                'receiver_id' => (int) $request->receiver_id,
                'message'     => $request->message,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);

            return response()->json($message, 201);

        } catch (\Exception $e) {
            Log::error('Message send error: ' . $e->getMessage());
            return response()->json([
                'error'   => 'Failed to send message',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function fetch($userId, Request $request)
    {
        try {
            $user = Auth::guard('api')->user();

            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $authId  = $user->id;
            $otherId = (int) $userId;
            $perPage = (int) $request->get('per_page', 20);

            $messages = Message::where(function ($q) use ($authId, $otherId) {
                $q->where('sender_id', $authId)
                  ->where('receiver_id', $otherId);
            })->orWhere(function ($q) use ($authId, $otherId) {
                $q->where('sender_id', $otherId)
                  ->where('receiver_id', $authId);
            })
            ->orderBy('created_at', 'asc')   // asc so frontend shows oldest→newest
            ->paginate($perPage);

            return response()->json($messages);

        } catch (\Exception $e) {
            Log::error('Message fetch error: ' . $e->getMessage());
            return response()->json([
                'error'   => 'Failed to fetch messages',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function conversations()
    {
        try {
            $user = Auth::guard('api')->user();

            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $authId = $user->id;

            // Get the latest message for each conversation
            $conversations = Message::where('sender_id', $authId)
                ->orWhere('receiver_id', $authId)
                ->with(['sender', 'receiver'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->unique(function ($message) use ($authId) {
                    return $message->sender_id == $authId ? $message->receiver_id : $message->sender_id;
                });

            $formattedConversations = $conversations->map(function ($message) use ($authId) {
                $otherUser = $message->sender_id == $authId ? $message->receiver : $message->sender;
                return [
                    'other_user' => $otherUser,
                    'last_message' => [
                        'message' => $message->message,
                        'created_at' => $message->created_at,
                        'type' => $message->type,
                        'is_read' => $message->is_read,
                    ],
                ];
            })->values();

            return response()->json($formattedConversations);

        } catch (\Exception $e) {
            Log::error('Conversations fetch error: ' . $e->getMessage());
            return response()->json([
                'error'   => 'Failed to fetch conversations',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}