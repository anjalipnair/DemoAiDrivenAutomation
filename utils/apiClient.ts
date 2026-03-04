import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { testData } from './testDataManager';

// Type definitions for API responses
export interface AuthResponse {
  sessionToken: string;
  user: {
    id: string;
    username: string;
    userType: string;
  };
  expiresIn: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; 
  image: string;
  inventoryCount: number;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface CartResponse {
  cartId: string;
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
}

export interface OrderSummary {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  paymentInfo: {
    cardNumber: string;
    cardType: string;
  };
  shippingInfo: {
    method: string;
  };
}

export interface ApiError {
  error: string;
  message: string;
  code?: string;
}

export interface TestResult {
  passed: boolean;
  statusCode: number;
  responseTime: number;
  data?: any;
  error?: string;
  validations?: ValidationResult[];
}

export interface ValidationResult {
  field: string;
  expected: any;
  actual: any;
  passed: boolean;
}

/**
 * SauceDemo API Client for testing
 */
export class SauceDemoApiClient {
  private client: AxiosInstance;
  private sessionToken: string | null = null;
  private endpoints: any;
  private testScenarios: any;
  
  constructor(baseUrl?: string) {
    const apiBaseUrl = baseUrl || this.loadApiConfig().baseUrl;
    
    this.client = axios.create({
      baseURL: apiBaseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    this.endpoints = this.loadApiConfig().endpoints;
    this.testScenarios = this.loadTestScenarios();
    
    // Request interceptor for logging
    this.client.interceptors.request.use((config) => {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
      if (config.data) {
        console.log(`[API] Request body:`, config.data);
      }
      return config;
    });
    
    // Response interceptor for logging and error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[API] Response: ${response.status} ${response.statusText}`);
        return response;
      },
      (error) => {
        console.log(`[API] Error: ${error.response?.status} ${error.response?.statusText}`);
        return Promise.reject(error);
      }
    );
  }
  
  private loadApiConfig(): any {
    const filePath = path.join(__dirname, '..', 'test-data', 'api', 'api-endpoints.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  
  private loadTestScenarios(): any {
    const filePath = path.join(__dirname, '..', 'test-data', 'api', 'api-test-scenarios.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  
  /**
   * Authentication Methods
   */
  async login(username: string, password: string): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const response = await this.client.post('/auth/login', {
        username,
        password
      });
      
      const responseTime = Date.now() - startTime;
      const authData: AuthResponse = response.data;
      
      // Store session token for subsequent requests
      this.sessionToken = authData.sessionToken;
      
      // Set authorization header for future requests
      this.client.defaults.headers.common['Authorization'] = `Bearer ${authData.sessionToken}`;
      
      // Validate response structure
      const validations = this.validateAuthResponse(authData);
      
      return {
        passed: response.status === 200 && validations.every(v => v.passed),
        statusCode: response.status,
        responseTime,
        data: authData,
        validations
      };
      
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      return {
        passed: false,
        statusCode: error.response?.status || 0,
        responseTime,
        error: error.response?.data?.message || error.message
      };
    }
  }
  
  async logout(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const response = await this.client.post('/auth/logout');
      const responseTime = Date.now() - startTime;
      
      // Clear session token
      this.sessionToken = null;
      delete this.client.defaults.headers.common['Authorization'];
      
      return {
        passed: response.status === 200,
        statusCode: response.status, 
        responseTime
      };
      
    } catch (error: any) {
      return {
        passed: false,
        statusCode: error.response?.status || 0,
        responseTime: Date.now() - startTime,
        error: error.response?.data?.message || error.message
      };
    }
  }
  
  async validateSession(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const response = await this.client.get('/auth/validate'); 
      
      return {
        passed: response.status === 200,
        statusCode: response.status,
        responseTime: Date.now() - startTime,
        data: response.data
      };
      
    } catch (error: any) {
      return {
        passed: false,
        statusCode: error.response?.status || 0,
        responseTime: Date.now() - startTime,
        error: error.response?.data?.message || error.message
      };
    }
  }
  
  /**
   * Product/Inventory Methods
   */
  async getProducts(sortBy?: string, sortOrder?: string): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const params: any = {};
      if (sortBy) params.sortBy = sortBy;
      if (sortOrder) params.sortOrder = sortOrder;
      
      const response = await this.client.get('/products', { params });
      const responseTime = Date.now() - startTime;
      
      const validations = this.validateProductsResponse(response.data);
      
      return {
        passed: response.status === 200 && validations.every(v => v.passed),
        statusCode: response.status,
        responseTime,
        data: response.data,
        validations
      };
      
    } catch (error: any) {
      return {
        passed: false,
        statusCode: error.response?.status || 0,
        responseTime: Date.now() - startTime,
        error: error.response?.data?.message || error.message
      };
    }
  }
  
  async getProduct(productId: string): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const response = await this.client.get(`/products/${productId}`);
      
      return {
        passed: response.status === 200,
        statusCode: response.status,
        responseTime: Date.now() - startTime,
        data: response.data
      };
      
    } catch (error: any) {
      return {
        passed: false,
        statusCode: error.response?.status || 0,
        responseTime: Date.now() - startTime,
        error: error.response?.data?.message || error.message
      };
    }
  }
  
  /**
   * Cart Methods
   */
  async getCart(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const response = await this.client.get('/cart');
      const responseTime = Date.now() - startTime;
      
      const validations = this.validateCartResponse(response.data);
      
      return {
        passed: response.status === 200 && validations.every(v => v.passed),
        statusCode: response.status,
        responseTime,
        data: response.data,
        validations
      };
      
    } catch (error: any) {
      return {
        passed: false,
        statusCode: error.response?.status || 0,
        responseTime: Date.now() - startTime,
        error: error.response?.data?.message || error.message
      };
    }
  }
  
  async addToCart(productId: string, quantity: number = 1): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const response = await this.client.post('/cart/items', {
        productId,
        quantity
      });
      
      return {
        passed: response.status === 201,
        statusCode: response.status,
        responseTime: Date.now() - startTime,
        data: response.data
      };
      
    } catch (error: any) {
      return {
        passed: false,
        statusCode: error.response?.status || 0,
        responseTime: Date.now() - startTime,
        error: error.response?.data?.message || error.message
      };
    }
  }
  
  async updateCartItem(productId: string, quantity: number): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const response = await this.client.put(`/cart/items/${productId}`, {
        quantity
      });
      
      return {
        passed: response.status === 200,
        statusCode: response.status,
        responseTime: Date.now() - startTime,
        data: response.data
      };
      
    } catch (error: any) {
      return {
        passed: false,
        statusCode: error.response?.status || 0,
        responseTime: Date.now() - startTime,
        error: error.response?.data?.message || error.message
      };
    }
  }
  
  async removeFromCart(productId: string): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const response = await this.client.delete(`/cart/items/${productId}`);
      
      return {
        passed: response.status === 200,
        statusCode: response.status,
        responseTime: Date.now() - startTime
      };
      
    } catch (error: any) {
      return {
        passed: false,
        statusCode: error.response?.status || 0,
        responseTime: Date.now() - startTime,
        error: error.response?.data?.message || error.message
      };
    }
  }
  
  async clearCart(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const response = await this.client.delete('/cart');
      
      return {
        passed: response.status === 200,
        statusCode: response.status,
        responseTime: Date.now() - startTime
      };
      
    } catch (error: any) {
      return {
        passed: false,
        statusCode: error.response?.status || 0,
        responseTime: Date.now() - startTime,
        error: error.response?.data?.message || error.message
      };
    }
  }
  
  /**
   * Checkout Methods
   */
  async submitCustomerInfo(firstName: string, lastName: string, postalCode: string): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const response = await this.client.post('/checkout/customer-info', {
        firstName,
        lastName,
        postalCode
      });
      
      return {
        passed: response.status === 200,
        statusCode: response.status,
        responseTime: Date.now() - startTime,
        data: response.data
      };
      
    } catch (error: any) {
      return {
        passed: false,
        statusCode: error.response?.status || 0,
        responseTime: Date.now() - startTime,
        error: error.response?.data?.message || error.message
      };
    }
  }
  
  async getOrderSummary(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const response = await this.client.get('/checkout/summary');
      const responseTime = Date.now() - startTime;
      
      const validations = this.validateOrderSummary(response.data);
      
      return {
        passed: response.status === 200 && validations.every(v => v.passed),
        statusCode: response.status,
        responseTime,
        data: response.data,
        validations
      };
      
    } catch (error: any) {
      return {
        passed: false,
        statusCode: error.response?.status || 0,
        responseTime: Date.now() - startTime,
        error: error.response?.data?.message || error.message
      };
    }
  }
  
  async completeOrder(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const response = await this.client.post('/checkout/complete');
      
      return {
        passed: response.status === 200,
        statusCode: response.status,
        responseTime: Date.now() - startTime,
        data: response.data
      };
      
    } catch (error: any) {
      return {
        passed: false,
        statusCode: error.response?.status || 0,
        responseTime: Date.now() - startTime,
        error: error.response?.data?.message || error.message
      };
    }
  }
  
  /**
   * Validation Methods
   */
  private validateAuthResponse(data: AuthResponse): ValidationResult[] {
    const validations: ValidationResult[] = [];
    
    // Check required fields
    const requiredFields = ['sessionToken', 'user', 'expiresIn'];
    requiredFields.forEach(field => {
      validations.push({
        field,
        expected: 'present',
        actual: data.hasOwnProperty(field) ? 'present' : 'missing',
        passed: data.hasOwnProperty(field)
      });
    });
    
    // Check user object structure
    if (data.user) {
      const userFields = ['id', 'username', 'userType'];
      userFields.forEach(field => {
        validations.push({
          field: `user.${field}`,
          expected: 'present',
          actual: data.user.hasOwnProperty(field) ? 'present' : 'missing',
          passed: data.user.hasOwnProperty(field)
        });
      });
    }
    
    return validations;
  }
  
  private validateProductsResponse(data: any): ValidationResult[] {
    const validations: ValidationResult[] = [];
    
    // Check required top-level fields
    validations.push({
      field: 'products',
      expected: 'array',
      actual: Array.isArray(data.products) ? 'array' : typeof data.products,
      passed: Array.isArray(data.products)
    });
    
    validations.push({
      field: 'totalCount',
      expected: 'number',
      actual: typeof data.totalCount,
      passed: typeof data.totalCount === 'number'
    });
    
    // Validate product structure
    if (Array.isArray(data.products) && data.products.length > 0) {
      const productFields = ['id', 'name', 'description', 'price', 'image', 'inventoryCount'];
      const firstProduct = data.products[0];
      
      productFields.forEach(field => {
        validations.push({
          field: `products[0].${field}`,
          expected: 'present',
          actual: firstProduct.hasOwnProperty(field) ? 'present' : 'missing',
          passed: firstProduct.hasOwnProperty(field)
        });
      });
    }
    
    return validations;
  }
  
  private validateCartResponse(data: CartResponse): ValidationResult[] {
    const validations: ValidationResult[] = [];
    
    const requiredFields = ['cartId', 'items', 'itemCount', 'totalAmount'];
    requiredFields.forEach(field => {
      validations.push({
        field,
        expected: 'present',
        actual: data.hasOwnProperty(field) ? 'present' : 'missing',
        passed: data.hasOwnProperty(field)
      });
    });
    
    // Validate items array
    if (data.items) {
      validations.push({
        field: 'items',
        expected: 'array',
        actual: Array.isArray(data.items) ? 'array' : typeof data.items,
        passed: Array.isArray(data.items)
      });
      
      // Check item count consistency
      validations.push({
        field: 'itemCount_consistency',
        expected: data.itemCount,
        actual: data.items.reduce((sum, item) => sum + item.quantity, 0),
        passed: data.itemCount === data.items.reduce((sum, item) => sum + item.quantity, 0)
      });
      
      // Check total amount calculation
      const calculatedTotal = data.items.reduce((sum, item) => sum + item.subtotal, 0);
      validations.push({
        field: 'totalAmount_calculation',
        expected: data.totalAmount,
        actual: calculatedTotal,
        passed: Math.abs(data.totalAmount - calculatedTotal) < 0.01 // Allow for floating point precision
      });
    }
    
    return validations;
  }
  
  private validateOrderSummary(data: OrderSummary): ValidationResult[] {
    const validations: ValidationResult[] = [];
    
    const requiredFields = ['items', 'subtotal', 'tax', 'shipping', 'total', 'paymentInfo', 'shippingInfo'];
    requiredFields.forEach(field => {
      validations.push({
        field,
        expected: 'present',
        actual: data.hasOwnProperty(field) ? 'present' : 'missing',
        passed: data.hasOwnProperty(field)
      });
    });
    
    // Validate total calculation
    const calculatedTotal = data.subtotal + data.tax + data.shipping;
    validations.push({
      field: 'total_calculation',
      expected: data.total,
      actual: calculatedTotal, 
      passed: Math.abs(data.total - calculatedTotal) < 0.01
    });
    
    return validations;
  }
  
  /**
   * High-level test scenario methods
   */
  async runAuthenticationScenario(scenarioName: string): Promise<TestResult[]> {
    const scenario = this.testScenarios.testScenarios.authentication[scenarioName];
    const results: TestResult[] = [];
    
    if (!scenario) {
      throw new Error(`Authentication scenario '${scenarioName}' not found`);
    }
    
    for (const request of scenario.requests) {
      const result = await this.login(request.username, request.password);
      
      // Add scenario-specific validations
      if (request.expectedError) {
        result.passed = !result.passed && result.error?.includes(request.expectedMessage);
      }
      
      results.push(result);
    }
    
    return results;
  }
  
  async runCartScenario(scenarioName: string): Promise<TestResult[]> {
    const scenario = this.testScenarios.testScenarios.cart[scenarioName];
    const results: TestResult[] = [];
    
    if (!scenario) {
      throw new Error(`Cart scenario '${scenarioName}' not found`);
    }
    
    // Execute setup if required
    if (scenario.setup) {
      for (const setupAction of scenario.setup) {
        await this.addToCart(setupAction.productId, setupAction.quantity);
      }
    }
    
    // Execute main requests
    for (const request of scenario.requests || []) {
      let result: TestResult;
      
      if (request.method === 'DELETE') {
        result = await this.removeFromCart(request.productId);
      } else {
        result = await this.addToCart(request.productId, request.quantity);
      }
      
      results.push(result);
    }
    
    // Validate final cart state
    const cartResult = await this.getCart();
    results.push(cartResult);
    
    return results;
  }
  
  /**
   * Performance testing methods
   */
  async runPerformanceTest(operation: string, iterations: number = 10): Promise<number[]> {
    const responseTimes: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      let result: TestResult;
      
      switch (operation) {
        case 'login':
          const user = testData.getUser('validUsers', 'standard'); 
          result = await this.login(user.username, user.password);
          break;
        case 'getProducts':
          result = await this.getProducts();
          break;
        case 'getCart':
          result = await this.getCart();
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
      
      responseTimes.push(result.responseTime);
    }
    
    return responseTimes;
  }
  
  /**
   * Utility methods
   */
  isAuthenticated(): boolean {
    return this.sessionToken !== null;
  }
  
  getSessionToken(): string | null {
    return this.sessionToken;
  }
  
  setSessionToken(token: string): void {
    this.sessionToken = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  clearSession(): void {
    this.sessionToken = null;
    delete this.client.defaults.headers.common['Authorization'];
  }
}

// Export singleton instance and factory
export const apiClient = new SauceDemoApiClient();

export const createApiClient = (baseUrl?: string) => new SauceDemoApiClient(baseUrl);

// Convenience functions
export const authenticateUser = async (username: string, password: string) => {
  return await apiClient.login(username, password);
};

export const getAuthenticatedClient = async (userKey: string = 'standard') => {
  const user = testData.getUser('validUsers', userKey);
  await apiClient.login(user.username, user.password);
  return apiClient;
};