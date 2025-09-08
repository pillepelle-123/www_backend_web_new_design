<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;

class UserMatch extends Model
{
    use HasFactory, CrudTrait, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'application_id',
        'affiliate_link_id',
        'link_clicked',
        'status',
        'success_status_applicant',
        'success_status_offerer',
        'reason_unsuccessful_applicant',
        'reason_unsuccessful_offerer',
        'is_archived_by_applicant',
        'is_archived_by_offerer'
    ];

    protected $casts = [
        'link_clicked' => 'boolean',
        'is_archived_by_applicant' => 'boolean',
        'is_archived_by_offerer' => 'boolean',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }
    
    public function affiliateLink(): BelongsTo
    {
        return $this->belongsTo(AffiliateLink::class);
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class);
    }
}
