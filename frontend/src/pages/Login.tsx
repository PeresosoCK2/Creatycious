import AuthForm from '../components/AuthForm';

const LOGIN_FIELDS = [
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'password', label: 'Password', type: 'password' },
];

export default function Login() {
  return (
    <AuthForm
      title="Login"
      endpoint="/auth/login"
      fields={LOGIN_FIELDS}
      submitLabel="Login"
    />
  );
}
