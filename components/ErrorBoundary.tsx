'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as Sentry from '@sentry/nextjs';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const Fallback = this.props.fallback;
        return <Fallback error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className="min-h-screen bg-void flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="font-serif text-2xl text-paper mb-2">
              Something went wrong
            </h2>
            <p className="text-paper/70 mb-6">
              We encountered an unexpected error. Please try again.
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={this.resetError}
              className="px-6 py-3 bg-lime text-void font-semibold rounded-lg mr-4"
            >
              Try Again
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => (window.location.href = '/home')}
              className="px-6 py-3 bg-paper/10 border border-paper/20 text-paper font-semibold rounded-lg"
            >
              Go Home
            </motion.button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
