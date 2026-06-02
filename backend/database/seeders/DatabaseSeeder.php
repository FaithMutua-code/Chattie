<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create a test user
        $testUser = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test33@example.com',
            'phone_number' => '+1234567890',
        ]);

        // Create additional users
        $users = User::factory(10)->create();

        // Create lost items with images
        Item::factory(8)
            ->lost()
            ->sequence(
                ['category' => 'electronics'],
                ['category' => 'wallet'],
                ['category' => 'keys'],
                ['category' => 'jewelry'],
                ['category' => 'clothing'],
                ['category' => 'documents'],
                ['category' => 'wallet'],
                ['category' => 'electronics'],
            )
            ->create();

        // Create found items with images
        Item::factory(8)
            ->found()
            ->sequence(
                ['category' => 'electronics'],
                ['category' => 'wallet'],
                ['category' => 'keys'],
                ['category' => 'jewelry'],
                ['category' => 'clothing'],
                ['category' => 'documents'],
                ['category' => 'wallet'],
                ['category' => 'other'],
            )
            ->create();

        // Create some recovered items with images
        Item::factory(5)
            ->recovered()
            ->create();

        // Create messages between users
        Message::factory(20)->create([
            'sender_id' => $testUser->id,
        ]);

        Message::factory(15)
            ->sequence(
                ['receiver_id' => $testUser->id],
                ['receiver_id' => $users->first()->id],
            )
            ->create();
    }
}

