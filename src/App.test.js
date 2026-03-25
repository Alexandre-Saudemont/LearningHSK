import { render, screen } from '@testing-library/react';
import App from './App';

test('affiche l’accueil LearningHSK', () => {
  render(<App />);
  expect(screen.getByText('LearningHSK')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /commencer/i })).toBeInTheDocument();
});
