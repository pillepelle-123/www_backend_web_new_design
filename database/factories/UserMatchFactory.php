<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
// use App\Models\User;
use App\Models\Application;
use App\Models\AffiliateLink;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserMatch>
 */
class UserMatchFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'application_id' => Application::factory(),
            // 'user_referrer_id' => User::factory(),
            // 'user_referred_id' => function (array $attributes) {
            //     return User::where('id', '!=', $attributes['user_referrer_id'])
            //         ->inRandomOrder()
            //         ->first()
            //         ->id;
            // },
            'affiliate_link_id' => AffiliateLink::factory(),
            'link_clicked' => $this->faker->boolean(0.25),
            'is_archived_by_applicant' => $this->faker->boolean(0.25),
            'is_archived_by_offerer' => $this->faker->boolean(0.25),
            'status' => $this->faker->randomElement(['opened', 'closed']),
            'success_status_applicant' => $this->faker->randomElement(['pending', 'successful', 'unsuccessful']),
            'success_status_offerer' => $this->faker->randomElement(['pending', 'successful', 'unsuccessful']),
            'reason_unsuccessful_applicant' => $this->faker->paragraph(),
            'reason_unsuccessful_offerer' => $this->faker->paragraph(),
        ];
    }
}
