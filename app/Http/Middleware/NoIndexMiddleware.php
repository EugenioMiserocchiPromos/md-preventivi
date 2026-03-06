<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class NoIndexMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (config('app.no_index', true)) {
            $response->headers->set('X-Robots-Tag', 'noindex, nofollow');
        }

        return $response;
    }
}
