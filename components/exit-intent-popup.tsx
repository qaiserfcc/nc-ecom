'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import NewsletterForm from './newsletter-form';

interface ExitIntentPopupProps {
  enabled?: boolean;
  trigger?: 'exit' | 'scroll' | 'time' | 'all';
  scrollThreshold?: number; // Percentage (0-100)
  timeDelay?: number; // Seconds
  showOnce?: boolean; // Show only once per session
}

export default function ExitIntentPopup({
  enabled = true,
  trigger = 'all',
  scrollThreshold = 50,
  timeDelay = 30,
  showOnce = true
}: ExitIntentPopupProps) {
  const [open, setOpen] = useState(false);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    if (!enabled || triggered) return;

    // Check if already shown in this session
    if (showOnce && sessionStorage.getItem('exitPopupShown')) {
      return;
    }

    // Exit intent detection (mouse leaving viewport)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && (trigger === 'exit' || trigger === 'all')) {
        showPopup();
      }
    };

    // Scroll depth detection
    const handleScroll = () => {
      if (trigger !== 'scroll' && trigger !== 'all') return;

      const scrollPercentage = 
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

      if (scrollPercentage >= scrollThreshold) {
        showPopup();
      }
    };

    // Time-based trigger
    let timeoutId: NodeJS.Timeout;
    if (trigger === 'time' || trigger === 'all') {
      timeoutId = setTimeout(() => {
        showPopup();
      }, timeDelay * 1000);
    }

    const showPopup = () => {
      if (triggered) return;
      setOpen(true);
      setTriggered(true);
      if (showOnce) {
        sessionStorage.setItem('exitPopupShown', 'true');
      }
    };

    // Add event listeners
    if (trigger === 'exit' || trigger === 'all') {
      document.addEventListener('mouseleave', handleMouseLeave);
    }
    if (trigger === 'scroll' || trigger === 'all') {
      window.addEventListener('scroll', handleScroll);
    }

    // Cleanup
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [enabled, trigger, scrollThreshold, timeDelay, triggered, showOnce]);

  const handleClose = () => {
    setOpen(false);
    // Track dismiss event
    fetch('/api/marketing/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'popup_close',
        eventData: { trigger }
      })
    }).catch(() => {});
  };

  useEffect(() => {
    if (open) {
      // Track popup view
      fetch('/api/marketing/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'popup_view',
          eventData: { trigger }
        })
      }).catch(() => {});
    }
  }, [open, trigger]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Wait! Don't Miss Out! 🎁</DialogTitle>
          <DialogDescription>
            Subscribe to our newsletter and get <strong>10% off</strong> your first order!
          </DialogDescription>
        </DialogHeader>
        
        <NewsletterForm
          variant="minimal"
          source="exit_popup"
          leadMagnetType="discount_code"
          showInterests={false}
          showSkinType={false}
        />

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </DialogContent>
    </Dialog>
  );
}
