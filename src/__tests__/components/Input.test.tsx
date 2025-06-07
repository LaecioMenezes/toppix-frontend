import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from '../../components/Input';

describe('Input Component', () => {
  it('deve renderizar o input com label', () => {
    render(<Input label="Nome" />);
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
  });

  it('deve mostrar mensagem de erro quando especificada', () => {
    render(<Input label="Email" error="Email é obrigatório" />);
    expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument();
  });

  it('deve aplicar estilo de erro quando há mensagem de erro', () => {
    render(<Input label="Email" error="Email é obrigatório" />);
    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveClass('border-error-500');
  });

  it('deve executar onChange quando o valor mudar', () => {
    const handleChange = vi.fn();
    render(<Input label="Nome" onChange={handleChange} />);
    
    const input = screen.getByLabelText(/nome/i);
    fireEvent.change(input, { target: { value: 'João' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('deve mostrar placeholder quando especificado', () => {
    render(<Input label="Nome" placeholder="Digite seu nome" />);
    expect(screen.getByPlaceholderText(/digite seu nome/i)).toBeInTheDocument();
  });

  it('deve renderizar ícone quando especificado', () => {
    const IconComponent = () => <span data-testid="icon">📧</span>;
    render(<Input label="Email" icon={<IconComponent />} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('deve estar desabilitado quando disabled for true', () => {
    render(<Input label="Nome" disabled />);
    const input = screen.getByLabelText(/nome/i);
    expect(input).toBeDisabled();
  });
}); 