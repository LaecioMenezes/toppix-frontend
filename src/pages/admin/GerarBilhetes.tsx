import React from 'react';

export function GerarBilhetes() {
  console.log('GerarBilhetes component is rendering'); // Debug log
  
  return (
    <div style={{ 
      padding: '24px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#eff6ff', // Cor diferente para debug
      minHeight: '400px'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '2px solid #3b82f6' // Border para debug
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#1f2937',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          🎫 GERAR BILHETES - DEBUG OK
        </h1>
        
        <div style={{ 
          padding: '16px',
          backgroundColor: '#dbeafe',
          borderRadius: '8px',
          marginBottom: '24px',
          textAlign: 'center',
          color: '#1e40af',
          fontWeight: 'bold'
        }}>
          ✅ Componente GerarBilhetes carregado com sucesso!
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600',
            color: '#374151'
          }}>
            Quantidade:
          </label>
          <input 
            type="number" 
            placeholder="Ex: 1000"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              backgroundColor: 'white'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600',
            color: '#374151'
          }}>
            Prefixo:
          </label>
          <input 
            type="text" 
            placeholder="Ex: GANHADOR"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              backgroundColor: 'white'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
        </div>

        <button 
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
          onClick={() => alert('Botão clicado - componente funcionando!')}
        >
          Gerar Bilhetes (TESTE)
        </button>

        <div style={{ 
          marginTop: '32px',
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '12px',
            margin: '0 0 12px 0'
          }}>
            ℹ️ Instruções
          </h3>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '20px',
            color: '#6b7280'
          }}>
            <li>Digite a quantidade de bilhetes desejada</li>
            <li>Defina um prefixo único para identificar os bilhetes</li>
            <li>Clique em "Gerar Bilhetes" para criar</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 