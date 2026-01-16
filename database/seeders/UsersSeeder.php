<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        DB::table('users')->updateOrInsert(
            ['email' => 'test@example.com'],
            [
                'name' => 'Eugenio',
                'surname' => 'Miserocchi',
                'initials' => 'EM',
                'password' => Hash::make('secret'),
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );
    }
}
