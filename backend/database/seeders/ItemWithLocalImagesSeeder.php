<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;

/**
 * Seeder for creating items with locally stored images.
 *
 * This seeder generates placeholder images and stores them locally.
 * Make sure the intervention/image package is installed:
 *
 * composer require intervention/image "^3.0"
 *
 * And published the config:
 * php artisan vendor:publish --provider="Intervention\Image\ImageManagerServiceProvider"
 */
class ItemWithLocalImagesSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    // Create directory if it doesn't exist
    if (!Storage::disk('public')->exists('items')) {
      Storage::disk('public')->makeDirectory('items');
    }

    // Create users first
    $users = User::factory(5)->create();

    // Create items with locally stored images
    foreach ($users as $user) {
      // Create 3 lost items per user
      for ($i = 0; $i < 3; $i++) {
        $item = Item::factory()
          ->lost()
          ->make([
            'user_id' => $user->id,
          ]);

        // Generate and store image locally
        $imagePath = $this->generateAndStoreImage();
        $item->image = $imagePath;
        $item->save();
      }

      // Create 2 found items per user
      for ($i = 0; $i < 2; $i++) {
        $item = Item::factory()
          ->found()
          ->make([
            'user_id' => $user->id,
          ]);

        // Generate and store image locally
        $imagePath = $this->generateAndStoreImage();
        $item->image = $imagePath;
        $item->save();
      }
    }
  }

  /**
   * Generate a placeholder image and store it locally.
   *
   * @return string The path to the stored image
   */
  protected function generateAndStoreImage(): string
  {
    // Create a placeholder image (600x600)
    $image = Image::canvas(600, 600, '#' . fake()->hexColor());

    // Add some random colored rectangles to make it look more interesting
    for ($i = 0; $i < 5; $i++) {
      $image->rectangle(
        fake()->numberBetween(10, 500),
        fake()->numberBetween(10, 500),
        fake()->numberBetween(550, 590),
        fake()->numberBetween(550, 590),
        '#' . fake()->hexColor()
      );
    }

    // Generate filename
    $filename = 'items/item_' . time() . '_' . uniqid() . '.png';

    // Store the image
    Storage::disk('public')->put($filename, (string) $image->encode());

    return $filename;
  }
}
