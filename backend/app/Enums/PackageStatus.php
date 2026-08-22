<?php

namespace App\Enums;

enum PackageStatus: string
{
    case Draft = 'draft';
    case Published = 'published';
}
