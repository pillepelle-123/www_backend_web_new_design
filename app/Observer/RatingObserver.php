<?php

namespace App\Observer;

use App\Models\Rating;
use App\Enums\RatingDirection;

class RatingObserver
{
    public function creating(Rating $rating)
    {
        $existingRatings = Rating::where('match_id', $rating->match_id)
            ->whereIn('direction', [
                RatingDirection::OFFERER_TO_APPLICANT->value,
                RatingDirection::APPLICANT_TO_OFFERER->value
            ])
            ->count();

        if ($existingRatings >= 2) {
            throw new \Exception('Maximal 2 Ratings pro Match erlaubt');
        }
    }
}
