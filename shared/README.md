# Shared Utilities and Configurations

This directory contains shared code that can be used across different parts of the project.

## Structure

```
shared/
├── types/              # TypeScript type definitions
├── constants/          # Shared constants
├── utils/             # Utility functions
└── config/            # Shared configuration
```

## Usage

### Backend
```python
from shared.constants import USER_ROLES
```

### Frontend
```typescript
import { API_ENDPOINTS } from '@shared/constants'
```
