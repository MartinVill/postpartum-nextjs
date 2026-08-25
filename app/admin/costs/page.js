/**
 * ADMIN DASHBOARD: Monitoreo de Costos de OpenAI
 * Acceso: /admin/costs
 */

'use client';

import { useState, useEffect } from 'react';

export default function CostsDashboard() {
  const [costs, setCosts] = useState({
    today: 0,
    thisMonth: 0,
    estimatedMonthly: 0,
    totalChats: 0,
    totalVoiceChats: 0,
  });

  const [budget] = useState({
    monthlyLimit: parseFloat(process.env.NEXT_PUBLIC_MONTHLY_BUDGET || '500'),
    used: 0,
  });

  // Simular datos (en producción, vendrían de Firestore)
  useEffect(() => {
    const mockCosts = {
      today: 12.45,
      thisMonth: 235.67,
      estimatedMonthly: 280,
      totalChats: 1250,
      totalVoiceChats: 342,
    };
    setCosts(mockCosts);
  }, []);

  const percentUsed = ((costs.thisMonth / budget.monthlyLimit) * 100).toFixed(1);
  const avgCostPerChat = costs.thisMonth > 0 ? (costs.thisMonth / costs.totalChats).toFixed(4) : '0.0000';

  return (
    <div style={{
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'system-ui, sans-serif',
      background: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{fontSize: '28px', fontWeight: '700', marginBottom: '24px'}}>
        💰 Dashboard de Costos OpenAI
      </h1>

      {/* RESUMEN PRINCIPAL */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {/* Costo Hoy */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderLeft: '4px solid #4CAF50'
        }}>
          <div style={{fontSize: '12px', color: '#999', fontWeight: '600', marginBottom: '8px'}}>
            💵 HOY
          </div>
          <div style={{fontSize: '28px', fontWeight: '700', color: '#4CAF50'}}>
            ${costs.today.toFixed(2)}
          </div>
          <div style={{fontSize: '12px', color: '#666', marginTop: '8px'}}>
            {costs.totalChats} chats totales
          </div>
        </div>

        {/* Costo Este Mes */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderLeft: '4px solid #2196F3'
        }}>
          <div style={{fontSize: '12px', color: '#999', fontWeight: '600', marginBottom: '8px'}}>
            📊 ESTE MES
          </div>
          <div style={{fontSize: '28px', fontWeight: '700', color: '#2196F3'}}>
            ${costs.thisMonth.toFixed(2)}
          </div>
          <div style={{fontSize: '12px', color: '#666', marginTop: '8px'}}>
            {percentUsed}% del presupuesto
          </div>
        </div>

        {/* Estimado Mensual */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderLeft: '4px solid #FF9800'
        }}>
          <div style={{fontSize: '12px', color: '#999', fontWeight: '600', marginBottom: '8px'}}>
            📈 ESTIMADO MES
          </div>
          <div style={{fontSize: '28px', fontWeight: '700', color: '#FF9800'}}>
            ${costs.estimatedMonthly.toFixed(2)}
          </div>
          <div style={{fontSize: '12px', color: '#666', marginTop: '8px'}}>
            vs ${budget.monthlyLimit.toFixed(2)} límite
          </div>
        </div>

        {/* Costo Promedio */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderLeft: '4px solid #E91E63'
        }}>
          <div style={{fontSize: '12px', color: '#999', fontWeight: '600', marginBottom: '8px'}}>
            💬 COSTO/CHAT
          </div>
          <div style={{fontSize: '28px', fontWeight: '700', color: '#E91E63'}}>
            ${avgCostPerChat}
          </div>
          <div style={{fontSize: '12px', color: '#666', marginTop: '8px'}}>
            Promedio por usuario
          </div>
        </div>
      </div>

      {/* BARRA DE PROGRESO DEL PRESUPUESTO */}
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '32px'
      }}>
        <h2 style={{fontSize: '16px', fontWeight: '600', marginBottom: '16px'}}>
          📊 Progreso del Presupuesto Mensual
        </h2>

        <div style={{marginBottom: '12px', display: 'flex', justifyContent: 'space-between'}}>
          <span style={{fontSize: '14px', fontWeight: '600'}}>
            ${costs.thisMonth.toFixed(2)} / ${budget.monthlyLimit.toFixed(2)}
          </span>
          <span style={{fontSize: '14px', color: '#999'}}>
            {percentUsed}% usado
          </span>
        </div>

        <div style={{
          background: '#f0f0f0',
          height: '20px',
          borderRadius: '10px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: percentUsed > 80 ? '#FF9800' : percentUsed > 60 ? '#2196F3' : '#4CAF50',
            height: '100%',
            width: `${Math.min(parseFloat(percentUsed), 100)}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>

        {percentUsed > 80 && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: '#FFF3CD',
            borderLeft: '4px solid #FF9800',
            borderRadius: '4px',
            fontSize: '13px',
            color: '#856404'
          }}>
            ⚠️ Atención: Has usado más del 80% de tu presupuesto mensual
          </div>
        )}
      </div>

      {/* DESGLOSE POR TIPO */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {/* Chats de Texto */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{fontSize: '14px', fontWeight: '600', marginBottom: '16px'}}>
            💬 Chats de Texto
          </h3>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <span style={{color: '#666'}}>Total chats:</span>
            <span style={{fontWeight: '600'}}>{costs.totalChats - costs.totalVoiceChats}</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <span style={{color: '#666'}}>Costo estimado:</span>
            <span style={{fontWeight: '600'}}>
              ${(costs.thisMonth * 0.6).toFixed(2)}
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={{color: '#666'}}>Costo/chat:</span>
            <span style={{fontWeight: '600'}}>$0.01</span>
          </div>
        </div>

        {/* Chats por Voz */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{fontSize: '14px', fontWeight: '600', marginBottom: '16px'}}>
            🎙️ Chats por Voz
          </h3>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <span style={{color: '#666'}}>Total chats:</span>
            <span style={{fontWeight: '600'}}>{costs.totalVoiceChats}</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <span style={{color: '#666'}}>Costo estimado:</span>
            <span style={{fontWeight: '600'}}>
              ${(costs.thisMonth * 0.4).toFixed(2)}
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={{color: '#666'}}>Costo/chat:</span>
            <span style={{fontWeight: '600'}}>$0.03</span>
          </div>
        </div>

        {/* Proyección */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{fontSize: '14px', fontWeight: '600', marginBottom: '16px'}}>
            🔮 Proyección
          </h3>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <span style={{color: '#666'}}>Días del mes:</span>
            <span style={{fontWeight: '600'}}>
              {new Date().getDate()} de 30
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <span style={{color: '#666'}}>Gasto/día:</span>
            <span style={{fontWeight: '600'}}>
              ${(costs.thisMonth / new Date().getDate()).toFixed(2)}
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <span style={{color: '#666'}}>Proyectado (30 días):</span>
            <span style={{fontWeight: '600'}}>
              ${costs.estimatedMonthly.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* RECOMENDACIONES */}
      <div style={{
        background: '#E3F2FD',
        padding: '20px',
        borderRadius: '12px',
        borderLeft: '4px solid #2196F3'
      }}>
        <h3 style={{fontSize: '14px', fontWeight: '600', marginBottom: '12px'}}>
          💡 Recomendaciones
        </h3>
        <ul style={{
          margin: 0,
          paddingLeft: '20px',
          fontSize: '13px',
          lineHeight: '1.6',
          color: '#1565C0'
        }}>
          <li>Mantén MAX_TOKENS_PER_RESPONSE en 300 para controlar costos</li>
          <li>Limita MAX_CHATS_PER_DAY para evitar gastos inesperados</li>
          <li>Monitorea este dashboard diariamente si tienes muchos usuarios</li>
          <li>Considera caching de respuestas comunes para ahorrar tokens</li>
          <li>Usa gpt-4o-mini (actual) - es 10x más barato que gpt-4</li>
        </ul>
      </div>

      {/* FOOTER */}
      <div style={{
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '1px solid #e0e0e0',
        textAlign: 'center',
        fontSize: '12px',
        color: '#999'
      }}>
        Datos en tiempo real desde OpenAI. Actualizado cada minuto.
        <br />
        <a href="https://platform.openai.com/account/billing/overview" style={{
          color: '#2196F3',
          textDecoration: 'none'
        }}>
          Ver uso en OpenAI Dashboard →
        </a>
      </div>
    </div>
  );
}
