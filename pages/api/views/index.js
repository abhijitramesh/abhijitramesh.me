import db from '@/lib/firebase';

export default async (_, res) => {
  // If Firebase is not configured, return a default response
  if (!db) {
    return res.status(200).json({ total: 0 });
  }

  try {
    const snapshot = await db.ref('views').once('value');
    const views = snapshot.val();
    
    if (!views) {
      return res.status(200).json({ total: 0 });
    }
    
    const allViews = Object.values(views).reduce((total, value) => total + value);

    return res.status(200).json({ total: allViews });
  } catch (error) {
    console.error('Firebase error:', error);
    return res.status(200).json({ total: 0 });
  }
};
