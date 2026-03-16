import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Page,
  Masthead,
  MastheadMain,
  MastheadToggle,
  MastheadBrand,
  PageSidebar,
  PageSidebarBody,
  Nav,
  NavList,
  NavItem,
  PageToggleButton,
  PageSection
} from '@patternfly/react-core';
import { BarsIcon } from '@patternfly/react-icons';

const navItems = [
  { to: '/expenses', label: 'Expenses' },
  { to: '/chores', label: 'Chores' },
  { to: '/workouts', label: 'Workouts' }
];

const AppLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);  // Start open → fixed left on desktop

  const onSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const SidebarContent = (
    <PageSidebarBody>
      <Nav aria-label="Main navigation">
        <NavList>
          {navItems.map(item => (
            <NavItem key={item.to} isActive={location.pathname === item.to}>
              <NavLink to={item.to}>
                {item.label}
              </NavLink>
            </NavItem>
          ))}
        </NavList>
      </Nav>
    </PageSidebarBody>
  );

  const masthead = (
    <Masthead>
      <MastheadMain>
        <MastheadToggle>
          <PageToggleButton
            isHamburgerButton
            aria-label="Global navigation"
            isSidebarOpen={isSidebarOpen}
            onSidebarToggle={onSidebarToggle}
            id="vertical-nav-toggle"
          >
            <BarsIcon />
          </PageToggleButton>
        </MastheadToggle>
        <MastheadBrand>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Family App</span>
        </MastheadBrand>
      </MastheadMain>
    </Masthead>
  );

  const sidebar = (
    <PageSidebar isSidebarOpen={isSidebarOpen} id="vertical-sidebar">
      {SidebarContent}
    </PageSidebar>
  );

  return (
    <Page masthead={masthead} sidebar={sidebar}>
      <PageSection>
        <Outlet />
      </PageSection>
    </Page>
  );
};

export default AppLayout;