import { useState, useEffect } from 'react';
import AuthService from '../services/authService'; 
// Ajuste o caminho de importação, se necessário

const auth = new AuthService();

// O hook agora não aceita parâmetros
export function useUser() { 
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function carregarUsuarioLogado() {
      setLoading(true); // Inicia o carregamento
      setError(null);   // Limpa erros anteriores
      
      try {
        // 1. BUSCA O ID DO USUÁRIO ATUALMENTE LOGADO
        const loggedUserId = await auth.getLoggedUserId(); 

        if (!loggedUserId) {
          // Se não houver ID, o usuário não está logado
          setError("Você precisa estar logado para ver esta página.");
          setUser(null);
          return;
        }

        // 2. BUSCA OS DADOS USANDO O ID ENCONTRADO
        const dados = await auth.getUserById(loggedUserId);
        
        if (!dados) {
          // Se o ID existe, mas os dados não vieram do banco
          setError("Dados do usuário logado não foram encontrados no sistema.");
        }
        
        setUser(dados);
        
      } catch (e) {
        console.error("Erro ao carregar usuário logado:", e);
        setError("Não foi possível carregar o perfil. Verifique sua conexão.");
        setUser(null);
      } finally {
        setLoading(false); // Finaliza o carregamento
      }
    }

    carregarUsuarioLogado();
  }, []); // Roda apenas uma vez ao montar o componente (pois não há dependências)

  // Retorna os estados de dados, carregamento e erro
  return { user, loading, error };
}