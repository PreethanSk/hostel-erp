import React from 'react'
import ReactDOM from 'react-dom/client'
import './assets/scss/app.scss';
import RouteInit from './routes/RouteInit';
import { StateProvider } from './providers/StateProvider';
import Reducer, { initialState } from './services/StateReducer';
import AppThemeProvider from './providers/AppThemeProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StateProvider initialState={initialState} reducer={Reducer}>
      <AppThemeProvider>
        <RouteInit />
      </AppThemeProvider>
    </StateProvider>
  </React.StrictMode>,
)
