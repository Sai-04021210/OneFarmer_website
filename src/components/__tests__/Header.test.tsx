import { render, screen } from '@testing-library/react';
import Header from '../Header';

describe('Header', () => {
  it('renders the logo', () => {
    render(<Header />);

    const logo = screen.getByRole('link', {
      name: /#OneFarmer/i,
    });

    expect(logo).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Header />);

    const homeLink = screen.getByRole('link', { name: /Home/i });
    const resourcesLink = screen.getByRole('link', { name: /Resources/i });
    const blogLink = screen.getByRole('link', { name: /Blog/i });
    const contactLink = screen.getByRole('link', { name: /Contact/i });

    expect(homeLink).toBeInTheDocument();
    expect(resourcesLink).toBeInTheDocument();
    expect(blogLink).toBeInTheDocument();
    expect(contactLink).toBeInTheDocument();
  });
});
