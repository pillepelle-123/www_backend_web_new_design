<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_match_id')->constrained('user_matches')->cascadeOnDelete();
            $table->enum('direction', ['offerer_to_applicant', 'applicant_to_offerer'])->default('applicant_to_offerer');
            $table->unsignedTinyInteger('score')->from(1)->to(5);
            $table->text('comment')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ratings');
    }
};
