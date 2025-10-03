-- Fix security issue: Add INSERT policy to profiles table
-- This allows users to manually create/update their profile during onboarding
CREATE POLICY "Users can create their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);