<?php

namespace App\Http\Controllers\Api;

use App\Enums\PackageStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\DraftPackageRequest;
use App\Http\Requests\PublishPackageRequest;
use App\Http\Resources\PackageListResource;
use App\Http\Resources\PackageResource;
use App\Models\Package;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PackageController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $packages = Package::query()
            ->with('property')
            ->withCount('inclusions')
            ->latest('updated_at')
            ->get();

        return PackageListResource::collection($packages);
    }

    public function store(DraftPackageRequest $request): JsonResponse
    {
        $package = Package::create($request->safe()->except('inclusions'));
        $package->inclusions()->sync($request->input('inclusions', []));

        return PackageResource::make($package->load('property', 'inclusions'))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Package $package): PackageResource
    {
        return PackageResource::make($package->load('property', 'inclusions'));
    }

    public function update(DraftPackageRequest $request, Package $package): PackageResource
    {
        abort_if($package->isPublished(), 409, 'Published packages can no longer be edited.');

        $package->update($request->safe()->except('inclusions'));

        if ($request->has('inclusions')) {
            $package->inclusions()->sync($request->input('inclusions'));
        }

        return PackageResource::make($package->load('property', 'inclusions'));
    }

    /**
     * Publish is its own sub-resource rather than a writable `status` field:
     * the state transition — and the rules that gate it — belong to the server.
     */
    public function publish(PublishPackageRequest $request, Package $package): PackageResource
    {
        abort_if($package->isPublished(), 409, 'This package has already been published.');

        $package->status = PackageStatus::Published;
        $package->published_at = now();
        $package->save();

        return PackageResource::make($package->load('property', 'inclusions'));
    }
}
