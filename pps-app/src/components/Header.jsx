import React from 'react';
import { Navbar, Container, Nav, Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function Header() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand href="/" className="fw-bold">
          {t('app_title')}
        </Navbar.Brand>
        <Nav className="ms-auto">
          <Dropdown align="end">
            <Dropdown.Toggle variant="outline-light" id="dropdown-lang" className="d-flex align-items-center gap-2">
              <Globe size={18} />
              {i18n.language === 'en' ? 'EN' : '中文'}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={() => changeLanguage('zh-TW')} active={i18n.language === 'zh-TW'}>
                繁體中文 (zh-TW)
              </Dropdown.Item>
              <Dropdown.Item onClick={() => changeLanguage('en')} active={i18n.language === 'en'}>
                English (EN)
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}
