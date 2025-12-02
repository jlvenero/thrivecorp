# ThriveCorp - Plataforma de Beneficio Empresarial Voltado a saude

![Build Status](https://github.com/jlvenero/thrivecorp/actions/workflows/deploy-backend.yml/badge.svg)
![SonarCloud Coverage](https://sonarcloud.io/api/project_badges/measure?project=jlvenero_thrivecorp&metric=coverage)
![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=jlvenero_thrivecorp&metric=alert_status)

## Sobre o Projeto

O **ThriveCorp** é uma plataforma web desenvolvida para intermediar o benefício de atividade física entre empresas, colaboradores e academias. O sistema permite que empresas subsidiem o acesso de seus funcionários a uma rede de academias parceiras.

Este projeto foi desenvolvido como parte do Trabalho de Conclusão de Curso / Disciplina de Portfólio do curso de Engenharia de Software.

---

## Tecnologias Utilizadas

O sistema segue uma arquitetura moderna, separando Frontend e Backend, com práticas de CI/CD e monitoramento.

### Frontend
* **React + Vite:** Para construção da SPA (Single Page Application).
* **Material UI (MUI):** Biblioteca de componentes para interface.
* **Axios:** Cliente HTTP para comunicação com a API.
* **Vitest + React Testing Library:** Testes unitários e de integração.

### Backend
* **Node.js + Express:** API RESTful.
* **MySQL:** Banco de dados relacional.
* **JWT (JSON Web Token):** Autenticação e autorização stateless.
* **Jest:** Framework de testes para o backend.
* **Winston:** Sistema de logs estruturados.

### Infraestrutura & DevOps
* **AWS Elastic Beanstalk:** Hospedagem da API Backend.
* **AWS S3 + CloudFront:** Hospedagem estática e CDN do Frontend.
* **GitHub Actions:** Pipelines de CI/CD automatizados.
* **SonarCloud:** Análise estática de código e cobertura de testes.
* **Grafana:** Monitoramento.

---

## Arquitetura

O projeto adota o modelo C4 de arquitetura e segue o padrão MVC (Model-View-Controller) no backend.

* **Segurança:** Controle de acesso baseado em papéis (RBAC) via middlewares.
* **Organização:** Estrutura de monorepo (`backend/` e `frontend/`).

## SonarCloud:
https://sonarcloud.io/project/overview?id=jlvenero_thrivecorp

## Registro de usuário:
Para um novo usuário poder ser registrado, ele faz uma solicitação de registro para o Admin da PLATAFORMA.
Após o mesmo aceitar, este novo usuário passa a poder a acessar a plataforma ThriveCorp

## Contas existentes para acessar a plataforma
Usuário: Admin thriveCorp
Login: admin@thrivecorp.com
Senha: 161103Lu#

Usuário: Empresa
Login: Empresa@lorz.com
Senha: Senha@123

Usuário: Colaborador
Login: MatsGabr@gmail.com
Senha: Senha@123

Usuário: Academia
Login: Smart@fit.com
Senha: Senha@123
