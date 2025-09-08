<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('applications')->cascadeOnDelete();
            // $table->foreignId('user_referrer_id')->constrained('users')->cascadeOnDelete();
            // $table->foreignId('user_referred_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('affiliate_link_id')->constrained('affiliate_links')->cascadeOnDelete();
            $table->boolean('link_clicked')->default(false);
            $table->boolean('is_archived_by_applicant')->default(false);
            $table->boolean('is_archived_by_offerer')->default(false);
            $table->enum('status', ['opened', 'closed'])->default('opened');            $table->enum('success_status_applicant', ['pending', 'successful', 'unsuccessful'])->default('pending');
            $table->enum('success_status_offerer', ['pending', 'successful', 'unsuccessful'])->default('pending');
            $table->text('reason_unsuccessful_applicant')->nullable();
            $table->text('reason_unsuccessful_offerer')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_matches');
    }
};
