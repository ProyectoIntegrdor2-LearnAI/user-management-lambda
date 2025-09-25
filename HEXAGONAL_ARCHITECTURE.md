# 🏗️ Arquitectura Hexagonal - User Management API

## 📁 Estructura del Proyecto

```
src/
├── domain/                          # Capa de Dominio (Núcleo del negocio)
│   ├── entities/                    # Entidades de dominio
│   ├── repositories/                # Interfaces de repositorios (puertos)
│   └── value-objects/               # Objetos de valor
│
├── application/                     # Capa de Aplicación (Casos de uso)
│   ├── use-cases/                   # Casos de uso específicos
│   └── services/                    # Servicios de aplicación
│
├── infrastructure/                  # Capa de Infraestructura (Adaptadores)
│   ├── persistence/                 # Implementaciones de repositorios
│   └── web/                         # Adaptadores web (Express)
│       ├── controllers/             # Controladores HTTP
│       ├── routes/                  # Definición de rutas
│       └── middleware/              # Middlewares de Express
│
└── shared/                          # Código compartido
    └── utils/                       # Utilidades comunes
```

## 🎯 Principios de la Arquitectura Hexagonal

### 1. **Dominio (Domain)**
- **Entidades**: Objetos de negocio con identidad (User, Session)
- **Value Objects**: Objetos inmutables sin identidad (Email, Password)
- **Repositorios**: Interfaces para persistencia (puertos de salida)

### 2. **Aplicación (Application)**
- **Casos de Uso**: Orquestación de la lógica de negocio
- **Servicios**: Lógica de aplicación transversal

### 3. **Infraestructura (Infrastructure)**
- **Persistencia**: Implementaciones concretas de repositorios
- **Web**: Adaptadores para HTTP/REST (puertos de entrada)

## 🔄 Flujo de Datos

```
HTTP Request → Controller → Use Case → Domain Entity → Repository Interface → Repository Implementation → Database
                ↑                                                                          ↓
            Response ← Presenter ← Use Case Response ← Domain Logic ← Database Result ←─┘
```

## 📋 Ventajas de esta Arquitectura

- ✅ **Independencia de frameworks**: El dominio no depende de Express o PostgreSQL
- ✅ **Fácil testing**: Se pueden mockear las interfaces fácilmente
- ✅ **Flexibilidad**: Se puede cambiar la BD o el framework web sin afectar el negocio
- ✅ **Mantenibilidad**: Separación clara de responsabilidades
- ✅ **Escalabilidad**: Fácil agregar nuevas funcionalidades

## 🚀 Cómo empezar

1. **Domain Layer**: Define entidades y value objects
2. **Application Layer**: Implementa casos de uso
3. **Infrastructure Layer**: Conecta con tecnologías específicas

¡Listo para recibir los componentes! 🎉