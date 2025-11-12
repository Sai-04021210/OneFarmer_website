import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '../Header';
import { SessionProvider } from 'next-auth/react';

describe('Header', () => {
  it('renders the logo', () => {
    render(
      <SessionProvider session={null}>
        <Header />
      </SessionProvider>
    );

    const logo = screen.getByRole('link', {
      name: /#OneFarmer/i,
    });

    expect(logo).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(
      <SessionProvider session={null}>
        <Header />
      </SessionProvider>
    );

    const homeLink = screen.getByRole('link', { name: /Home/i });
    const resourcesLink = screen.getByRole('link', { name: /Resources/i });
    const blogLink = screen.getByRole('link', { name: /Blog/i });
    const contactLink = screen.getByRole('link', { name: /Contact/i });

    expect(homeLink).toBeInTheDocument();
    expect(resourcesLink).toBeInTheDocument();
    expect(blogLink).toBeInTheDocument();
    expect(contactLink).toBeInTheDocument();
  });

  it('renders login button when not logged in', () => {
    render(
      <SessionProvider session={null}>
        <Header />
      </SessionProvider>
    );

    const loginButton = screen.getByRole('button', { name: /Login/i });
    expect(loginButton).toBeInTheDocument();
  });

  it('renders logout button when logged in', () => {
    const session = {
      user: { name: 'viewer', email: 'viewer@test.com', image: '', role: 'viewer' },
      expires: '1',
    };
    render(
      <SessionProvider session={session}>
        <Header />
      </SessionProvider>
    );

    const logoutButton = screen.getByRole('button', { name: /Logout/i });
    expect(logoutButton).toBeInTheDocument();
  });

  it('renders admin link when admin is logged in', async () => {
    const session = {
      user: { name: 'admin', email: 'admin@test.com', image: '', role: 'admin' },
      expires: '1',
    };
    render(
      <SessionProvider session={session}>
        <Header />
      </SessionProvider>
    );

    const categoriesLink = screen.getByRole('link', { name: /Categories/i });
    await userEvent.hover(categoriesLink);

    const adminLink = await screen.findByRole('link', { name: /Admin/i });
    expect(adminLink).toBeInTheDocument();
  });
});
