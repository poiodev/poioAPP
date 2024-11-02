import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RouterModule, Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [ReactiveFormsModule, RouterModule],
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: [''],
      password: [''],
    });
  }

  register() {
    const { username, password } = this.registerForm.value;
    this.authService.register(username, password).subscribe(
      (res) => {
        alert('Registro exitoso');
        this.router.navigate(['/login']);
      },
      (err) => {
        console.error(err);
        alert('Error al registrar');
      }
    );
  }
}
