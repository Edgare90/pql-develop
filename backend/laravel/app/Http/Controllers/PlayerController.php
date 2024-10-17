<?php

namespace App\Http\Controllers;
use App\Models\Player;
use Illuminate\Http\Request;

class PlayerController extends Controller
{
    public function unassigned()
    {
        return Player::whereNull('team_id')->get();
    }
}
