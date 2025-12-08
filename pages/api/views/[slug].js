import db from '@/lib/firebase';

export default async (req, res) => {
  // If Firebase is not configured, return a default response
  if (!db) {
    return res.status(200).json({ total: 0 });
  }

  try {
    if (req.method === 'POST') {
      const ref = db.ref('views').child(req.query.slug);
      const { snapshot } = await ref.transaction((currentViews) => {
        if (currentViews === null) {
          return 1;
        }

        return currentViews + 1;
      });

      return res.status(200).json({
        total: snapshot.val()
      });
    }

    if (req.method === 'GET') {
      const snapshot = await db.ref('views').child(req.query.slug).once('value');
      const views = snapshot.val();

      return res.status(200).json({ total: views });
    }
  } catch (error) {
    console.error('Firebase error:', error);
    return res.status(200).json({ total: 0 });
  }
};
