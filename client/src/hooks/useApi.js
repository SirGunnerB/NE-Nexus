import { useState, useCallback } from 'react';
import axios from '../utils/axios';

export const useApi = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (config) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios(config);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, execute, reset };
};

export const usePaginatedApi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  const execute = useCallback(async (config) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios(config);
      setData(response.data.items || response.data);
      setPagination({
        currentPage: response.data.currentPage || 1,
        totalPages: response.data.totalPages || 1,
        total: response.data.total || response.data.length
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData([]);
    setLoading(false);
    setError(null);
    setPagination({
      currentPage: 1,
      totalPages: 1,
      total: 0
    });
  }, []);

  return { data, loading, error, pagination, execute, reset };
};

export const useInfiniteApi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const execute = useCallback(async (config) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios({
        ...config,
        params: {
          ...config.params,
          page
        }
      });
      
      const newData = response.data.items || response.data;
      setData(prev => [...prev, ...newData]);
      setHasMore(page < (response.data.totalPages || 1));
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [page]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  const refresh = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
  }, []);

  return { data, loading, error, hasMore, execute, loadMore, refresh };
};

export default useApi; 