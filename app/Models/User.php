<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'surname',
        'initials',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (User $user) {
            $computed = $user->computedInitials();

            if ($computed !== '' && $user->initials !== $computed) {
                $user->initials = $computed;
            }
        });
    }

    public function computedInitials(): string
    {
        $name = trim((string) $this->name);
        $surname = trim((string) $this->surname);

        if ($name === '' || $surname === '') {
            return trim((string) $this->initials);
        }

        $initials = strtoupper(substr($name, 0, 1).substr($surname, 0, 1));

        return $initials;
    }
}
