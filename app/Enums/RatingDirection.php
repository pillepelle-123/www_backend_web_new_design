<?php

namespace App\Enums;
enum RatingDirection: string
{
    case OFFERER_TO_APPLICANT = 'offerer_to_applicant';
    case APPLICANT_TO_OFFERER = 'applicant_to_offerer';
}
