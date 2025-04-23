// lib/services/adminServices.js
import { createClient } from '@supabase/supabase-js';


export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_API_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);


export const getAllUsers = async () => {
  try {
    const { data, error } = await supabaseAdmin?.auth?.admin?.listUsers();

    if (error) {
      console.log('Supabase error:', error);
      return { error: error.message };
    }

    console.log("Fetched users:", data.users.length);
    console.log("Fetched users:", data.users);
    return { users: data.users };

  } catch (error) {
    console.log('Unexpected error:', error);
    return { error: error.message };
  }
};

export const updateUserRoles = async (userId, newRoles) => {
  try {
    const { data, error } = await supabaseAdmin?.auth?.admin?.updateUserById(userId, {
      user_metadata: {
        system_roles: newRoles,
      },
    });

    if (error) {
      console.log('Failed to update role:', error.message);
    } else {
      console.log('User roles updated successfully:', data);
    }
  } catch (err) {
    console.log('Unexpected error while updating roles:', err);
  }
};
