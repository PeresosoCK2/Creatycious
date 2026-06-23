import AuthForm from '../components/AuthForm';

const REGISTER_FIELDS = [
  { name: 'name', label: 'Name' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'password', label: 'Password', type: 'password' },
];

export default function Register() {
  return (
    <AuthForm
      title="Register"
      endpoint="/auth/register"
      fields={REGISTER_FIELDS}
      submitLabel="Register"
    />
  );
}
