import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from '../Layout';

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('Layout', () => {
  it('deve renderizar o layout com título', () => {
    const { getByText } = renderWithRouter(
      <Layout title="Teste">
        <div>Conteúdo</div>
      </Layout>
    );

    expect(getByText('Teste')).toBeInTheDocument();
    expect(getByText('Conteúdo')).toBeInTheDocument();
  });

  it('deve aplicar classe de fundo quando especificada', () => {
    const { container } = renderWithRouter(
      <Layout title="Teste" background="bg-primary-50">
        <div>Conteúdo</div>
      </Layout>
    );

    const main = container.querySelector('main');
    expect(main).toHaveClass('bg-primary-50');
  });

  it('deve renderizar ação no cabeçalho quando fornecida', () => {
    const action = <button>Ação</button>;
    
    const { getByRole } = renderWithRouter(
      <Layout title="Teste" headerAction={action}>
        <div>Conteúdo</div>
      </Layout>
    );

    expect(getByRole('button', { name: 'Ação' })).toBeInTheDocument();
  });

  it('deve aplicar padding correto em mobile', () => {
    const { container } = renderWithRouter(
      <Layout title="Teste">
        <div>Conteúdo</div>
      </Layout>
    );

    const main = container.querySelector('main');
    expect(main).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
  });
}); 