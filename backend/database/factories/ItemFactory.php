<?php

namespace Database\Factories;

use App\Models\Item;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Item>
 */
class ItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['lost', 'found'];
        $categories = ['electronics', 'wallet', 'keys', 'jewelry', 'clothing', 'documents', 'other'];
        $recoveryMethods = ['system_match', 'direct_contact', 'admin_assisted'];

        return [
            'user_id' => User::factory(),
            'title' => fake()->words(3, true),
            'description' => fake()->sentences(3, true),
            'category' => fake()->randomElement($categories),
            'date_lost_found' => fake()->dateTimeBetween('-30 days', 'now'),
            'location' => fake()->address(),
            'latitude' => fake()->latitude(),
            'longitude' => fake()->longitude(),
            'type' => fake()->randomElement($types),
            'image' => $this->generateImageUrl(),
            'status' => 'active',
            'recovery_method' => null,
            'recovery_notes' => null,
            'recovered_at' => null,
            'recovered_by' => null,
        ];
    }

    /**
     * Generate a placeholder image URL using Lorem Picsum
     * Images are randomly generated with different dimensions
     */
    protected function generateImageUrl(): string
    {
        $width = fake()->randomElement([300, 400, 500, 600]);
        $height = fake()->randomElement([300, 400, 500, 600]);
        $imageId = fake()->numberBetween(1, 100);

        return "https://picsum.photos/{$width}/{$height}?random={$imageId}&seed=" . fake()->unique()->numberBetween(1, 10000);
    }

    /**
     * Indicate that the item is lost.
     */
    public function lost(): static
    {
        return $this->state(fn(array $attributes) => [
            'type' => 'lost',
            'status' => 'active', // ← must be 'active'
        ]);
    }

    public function found(): static
    {
        return $this->state(fn(array $attributes) => [
            'type' => 'found',
            'status' => 'active', // ← must be 'active'
        ]);
    }

    public function recovered(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'returned',
            'recovery_method' => fake()->randomElement(['system_match', 'direct_contact', 'admin_assisted']),
            'recovery_notes' => fake()->sentences(2, true),
            'recovered_at' => fake()->dateTimeBetween('-7 days', 'now'),
            'recovered_by' => User::factory(),
        ]);
    }
}
