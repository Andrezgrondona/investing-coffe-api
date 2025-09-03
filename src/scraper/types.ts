export interface CoffeePriceData {
    precioActual: string;
    cambio: string;
    cambioPorcentual: string;
    precioCompra: string;  
    precioVenta: string;  
    fechaActualizacion: string;
    unidad: string;
  }
  
  export interface ApiResponse {
    success: boolean;
    data: CoffeePriceData;
    message?: string;
    error?: string;
  }