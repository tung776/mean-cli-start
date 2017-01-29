import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { UserService } from '../../_services/user.service';
import { User } from '../../_models/user';

@Component({
	selector: 'app-users',
	templateUrl: './manage-users.component.html',
	styleUrls: ['./manage-users.component.scss']
})
export class ManageUsersComponent implements OnInit {
	// instantiate users to an empty array
	error: string;
	jwt: string;

    currentUser: User;
    users: User[] = [];

    constructor(private userService: UserService) {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }

	onSubmit() {

	}

	addUser(user) {
		this.userService.create(user).subscribe(
			user => this.users.push(user)
		);
	}

    deleteUser(id: number) {
        this.userService.delete(id).subscribe(() => { this.getAllUsers() });
    }

    private getAllUsers() {
        this.userService.getAll().subscribe(users => { this.users = users; });
    }

	ngOnInit() {
        this.getAllUsers();

	}
}
