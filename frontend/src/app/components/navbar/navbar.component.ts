import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  username = '';
  private sub!: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.sub = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.username = user?.username || '';
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  logout(): void {
    this.authService.logout();
  }
}
