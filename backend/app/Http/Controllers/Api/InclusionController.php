<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\InclusionResource;
use App\Models\Inclusion;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class InclusionController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return InclusionResource::collection(
            Inclusion::query()->orderBy('category')->orderBy('name')->get()
        );
    }
}
