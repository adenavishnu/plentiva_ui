# Contributing to Plentiva UI

Thank you for your interest in contributing to Plentiva! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Accept responsibility and learn from mistakes

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Git
- Java 17+ (for backend services)
- Basic knowledge of Next.js, TypeScript, and React

### Setup Development Environment

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/plentiva_ui.git
   cd plentiva_ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your backend URLs
   ```

4. **Start backend services**
   ```bash
   # In separate terminals
   cd path/to/product-service && mvn spring-boot:run  # Port 8082
   cd path/to/upload-service && mvn spring-boot:run   # Port 8081
   cd path/to/payment-service && mvn spring-boot:run  # Port 8080
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open browser**
   Navigate to http://localhost:3000

## Development Workflow

### Branch Naming Convention

- `feature/` - New features
  - Example: `feature/product-search`
- `fix/` - Bug fixes
  - Example: `fix/cart-total-calculation`
- `docs/` - Documentation updates
  - Example: `docs/api-reference`
- `refactor/` - Code refactoring
  - Example: `refactor/product-api-client`
- `style/` - UI/styling changes
  - Example: `style/navbar-gradient`

### Creating a Feature Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### Making Changes

1. Make your changes in the feature branch
2. Test thoroughly (see [Testing](#testing))
3. Update documentation if needed
4. Commit with meaningful messages (see [Commit Guidelines](#commit-guidelines))

## Coding Standards

### TypeScript

- Always use TypeScript, avoid `any` type
- Define interfaces for all data structures
- Use type inference where appropriate

```typescript
// ✅ Good
interface Product {
  id: string;
  name: string;
  price: number;
}

const getProduct = async (id: string): Promise<Product | null> => {
  // ...
}

// ❌ Bad
const getProduct = async (id: any): Promise<any> => {
  // ...
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use `"use client"` directive when needed
- Props should have explicit types

```typescript
// ✅ Good
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // ...
}

// ❌ Bad
export default function ProductCard(props: any) {
  // ...
}
```

### Styling

- Use Tailwind CSS utility classes
- Follow the gradient theme: `from-blue-600 via-purple-600 to-pink-600`
- Keep responsive design in mind
- Use consistent spacing (4, 6, 8, 12, 16)

```tsx
// ✅ Good
<button className="rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-2 text-white hover:shadow-lg">
  Click Me
</button>

// ❌ Bad
<button style={{background: 'blue', padding: '10px'}}>
  Click Me
</button>
```

### API Integration

- Always use async/await
- Handle errors gracefully
- Use the API functions from `lib/api.ts`

```typescript
// ✅ Good
try {
  const products = await getAllProductsFromAPI();
  setProducts(products);
} catch (error) {
  console.error("Failed to load products:", error);
  setError("Unable to load products. Please try again.");
}

// ❌ Bad
getAllProductsFromAPI().then(p => setProducts(p));
```

### File Organization

```
src/
├── app/              # Pages (Next.js App Router)
├── components/       # Reusable UI components
│   └── common/       # Shared/generic components
├── context/          # React Context providers
├── lib/              # Utility functions and API clients
└── types/            # TypeScript type definitions
```

### Naming Conventions

- **Files**: Use kebab-case for files
  - `product-card.tsx`, `api-client.ts`
  
- **Components**: Use PascalCase
  - `ProductCard`, `MediaUploader`
  
- **Functions**: Use camelCase
  - `getAllProducts`, `handleDelete`
  
- **Constants**: Use UPPER_SNAKE_CASE
  - `API_BASE_URL`, `MAX_UPLOAD_SIZE`

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
# Good commit messages
git commit -m "feat(products): add backend API integration"
git commit -m "fix(cart): correct total price calculation"
git commit -m "docs(readme): update installation instructions"
git commit -m "style(navbar): apply gradient theme to logo"
git commit -m "refactor(api): extract common fetch logic"

# Bad commit messages
git commit -m "fix stuff"
git commit -m "update"
git commit -m "asdf"
```

### Commit Best Practices

- Keep commits atomic (one logical change per commit)
- Write meaningful commit messages
- Reference issue numbers when applicable
  - `fix(cart): resolve duplicate items (#23)`

## Pull Request Process

### Before Submitting

1. **Update your branch with main**
   ```bash
   git checkout main
   git pull origin main
   git checkout your-branch
   git rebase main
   ```

2. **Run linter**
   ```bash
   npm run lint
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Test thoroughly**
   - Test your changes manually
   - Verify no console errors
   - Check responsive design

### Creating a Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open PR on GitHub**
   - Go to the repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tested on multiple browsers

## Screenshots (if applicable)
Add screenshots here

## Related Issues
Closes #(issue number)
```

### PR Review Process

1. Maintainers will review your PR
2. Address any feedback or requested changes
3. Once approved, your PR will be merged
4. Your branch will be deleted after merge

## Testing

### Manual Testing Checklist

- [ ] Home page loads products correctly
- [ ] Product creation works via admin panel
- [ ] Product editing saves changes
- [ ] Product deletion removes item
- [ ] Cart functionality works
- [ ] Images load properly
- [ ] Responsive design on mobile
- [ ] No console errors

### Browser Testing

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### API Testing

Use browser DevTools Network tab to verify:
- API calls are made to correct endpoints
- Response status codes are correct
- Request/response payloads are valid

## Documentation

### When to Update Documentation

- Adding new features → Update README.md
- Changing API → Update API.md
- Backend integration → Update BACKEND_INTEGRATION.md
- Breaking changes → Update CHANGELOG.md

### Documentation Style

- Use clear, concise language
- Provide code examples
- Include screenshots for UI changes
- Keep formatting consistent

### Code Comments

```typescript
/**
 * Fetches all products from the backend API
 * 
 * @returns Promise resolving to array of products
 * @throws Error if API request fails
 */
export async function getAllProductsFromAPI(): Promise<Product[]> {
  // Implementation
}
```

## Common Issues

### Port 3000 Already in Use

```bash
# Windows
netstat -ano | findstr :3000
taskkill /F /PID <PID>

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### TypeScript Errors

```bash
# Clear TypeScript cache
rm -rf .next
rm -rf node_modules/.cache
```

### Backend Connection Issues

- Verify backend services are running
- Check environment variables in `.env.local`
- Verify Next.js rewrites in `next.config.ts`

## Getting Help

- **Ask Questions**: Open a GitHub Discussion
- **Report Bugs**: Create an Issue with bug report template
- **Request Features**: Create an Issue with feature request template
- **Chat**: Join our Discord (if available)

## Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Credited in commit history

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to Plentiva! 🎉**
