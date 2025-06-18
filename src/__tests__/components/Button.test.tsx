import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../../components/Button';

describe('Button Component', () => {
  it('deve renderizar o botão com texto', () => {
    render(<Button>Clique aqui</Button>);
    expect(screen.getByRole('button', { name: /clique aqui/i })).toBeInTheDocument();
  });

  it('deve executar a função onClick quando clicado', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clique aqui</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('deve estar desabilitado quando a prop disabled for true', () => {
    render(<Button disabled>Botão desabilitado</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('deve mostrar loading quando a prop loading for true', () => {
    render(<Button loading>Carregando</Button>);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('deve aplicar variante primary por padrão', () => {
    render(<Button>Botão Primário</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary-500');
  });

  it('deve aplicar variante secondary quando especificada', () => {
    render(<Button variant="secondary">Botão Secundário</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-secondary-100');
  });

  it('deve aplicar tamanho small quando especificado', () => {
    render(<Button size="small">Botão Pequeno</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('py-2', 'px-4', 'text-sm');
  });

  it('deve aplicar tamanho large quando especificado', () => {
    render(<Button size="large">Botão Grande</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('py-4', 'px-8', 'text-lg');
  });
}); 