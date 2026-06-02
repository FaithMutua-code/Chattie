# Database Seeding Guide

This guide explains how to use the database seeders to populate your Findora database with test data, including images.

## Quick Start

Run the default seeder which uses online image URLs (no setup required):

```bash
php artisan db:seed
```

This will create:

- 1 test user (test@example.com)
- 10 additional random users
- 8 lost items with images
- 8 found items with images
- 5 recovered items with images
- 20-35 messages between users

## Seeders Available

### 1. **DatabaseSeeder** (default)

Uses external image URLs (Lorem Picsum) - no additional setup needed.

**Benefits:**

- ✅ No additional packages required
- ✅ Quick setup
- ✅ Real random images every time
- ✅ Good for development and testing

**Run:**

```bash
php artisan db:seed
```

### 2. **ItemWithLocalImagesSeeder** (optional)

Generates and stores images locally - requires Intervention Image package.

**Benefits:**

- ✅ No external dependencies
- ✅ Faster loading (local storage)
- ✅ Full control over image generation
- ✅ Works offline

**Setup:**

```bash
# Install Intervention Image
composer require intervention/image "^3.0"

# Publish the configuration
php artisan vendor:publish --provider="Intervention\Image\ImageManagerServiceProvider"

# Run the seeder
php artisan db:seed --class=ItemWithLocalImagesSeeder
```

## Factories

### UserFactory

Generates random user data including:

- Name
- Email (unique)
- Phone number
- Email verification status
- Password (hashed)

Usage:

```php
User::factory()->create();              // Create 1 user
User::factory(10)->create();            // Create 10 users
User::factory()->unverified()->create(); // Create unverified user
```

### ItemFactory

Generates random item data with images:

- Title & description
- Category (electronics, wallet, keys, jewelry, clothing, documents, other)
- Location (address) with latitude/longitude
- Item type (lost/found)
- Status (reported, recovery_in_progress, recovered, closed)
- Random image URL

**States available:**

```php
Item::factory()->lost()->create();       // Create lost item
Item::factory()->found()->create();      // Create found item
Item::factory()->recovered()->create();  // Create recovered item
```

Usage:

```php
Item::factory()->create();               // Create 1 item
Item::factory(20)->create();             // Create 20 items
Item::factory()->lost()->create();       // Create lost item
```

### MessageFactory

Generates random message data:

- Sender & receiver (random users)
- Message content
- Type (text, notification, system)
- Read status
- Read timestamp

Usage:

```php
Message::factory()->create();            // Create 1 message
Message::factory(50)->create();          // Create 50 messages
```

## Custom Seeding

### Create a custom seeder:

```bash
php artisan make:seeder CustomItemSeeder
```

### Example: Seed specific categories

```php
<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\User;
use Illuminate\Database\Seeder;

class CustomItemSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();

        // Create 5 lost electronics
        Item::factory(5)
            ->lost()
            ->for($user)
            ->create([
                'category' => 'electronics',
            ]);

        // Create 3 found wallet items
        Item::factory(3)
            ->found()
            ->for($user)
            ->create([
                'category' => 'wallet',
            ]);
    }
}
```

### Run custom seeder:

```bash
php artisan db:seed --class=CustomItemSeeder
```

## Refreshing the Database

To completely reset and reseed:

```bash
# Clear all data and reseed
php artisan migrate:fresh --seed

# With specific seeder
php artisan migrate:fresh --seed --seeder=ItemWithLocalImagesSeeder
```

## Image Handling

### Using External URLs (Default)

- Images are served from picsum.photos
- Each request generates a new random image
- No storage space required
- Works without additional packages

### Using Local Images (Optional)

- Images stored in `storage/app/public/items/`
- Make symlink to access: `php artisan storage:link`
- Access images via: `storage/items/item_*.png`
- Requires Intervention Image package

## Troubleshooting

### Images not showing in local seeder

1. Install Intervention Image: `composer require intervention/image "^3.0"`
2. Publish config: `php artisan vendor:publish --provider="Intervention\Image\ImageManagerServiceProvider"`
3. Create storage symlink: `php artisan storage:link`

### Seeder not found

- Make sure seeder file is in `database/seeders/`
- Use full class name: `php artisan db:seed --class=Database\Seeders\ItemWithLocalImagesSeeder`

### Foreign key constraint errors

- Run migrations first: `php artisan migrate`
- Ensure all related models exist

## API Testing with Seeded Data

Once seeded, test your API endpoints:

```bash
# Get all items
curl http://localhost:8000/api/items

# Get items by user
curl http://localhost:8000/api/users/1/items

# Search items by category
curl http://localhost:8000/api/items?category=lost
```

## Notes

- Test user credentials: `test@example.com` / `password`
- All seeded data uses faker data - it's randomly generated
- Images in default seeder load from external URL (requires internet)
- Factories can be combined with `->sequence()` for specific data patterns
- Use `->count()` instead of factory parameter for clarity: `Item::factory()->count(10)->create()`
