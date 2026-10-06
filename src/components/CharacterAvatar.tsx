import { useMemo } from 'react';

export interface CharacterFeatures {
  gender: 'boy' | 'girl';
  skinTone: string;
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  hasGlasses: boolean;
}

interface CharacterAvatarProps {
  features: CharacterFeatures;
  size?: 'sm' | 'md' | 'lg';
}

export function CharacterAvatar({ features, size = 'md' }: CharacterAvatarProps) {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-40 h-40',
    lg: 'w-56 h-56'
  };

  const avatarUrl = useMemo(() => {
    // Use DiceBear v6 Avataaars which WORKS and shows actual features
    
    const baseUrl = '/ n';
    const skinColors: Record<string, string> = {
        // SKIN COLOR - these show actual skin tones
      'light': 'Light',
      'medium': 'Brown',
      'tan': 'Yellow',
      'olive': 'Brown',
      'brown': 'DarkBrown',
      'dark': 'Black'
    };
    
    // HAIR COLOR - these show actual hair colors
    const topColors: Record<string, string> = {
      'blonde': 'Blonde',
      'brown': 'Brown',
      'black': 'Black',
      'red': 'Red',
      'auburn': 'Auburn',
      'gray': 'Gray'
    };
    
    // HAIR STYLE
    const isBoy = features.gender === 'boy';
    const tops: Record<string, string> = {
      'short': isBoy ? 'ShortHairShortFlat' : 'ShortHairShortWaved',
      'long': isBoy ? 'LongHairStraight' : 'LongHairCurly',
      'curly': 'ShortHairShortCurly',
      'ponytail': 'LongHairStraight'
    };
    
    // Build URL with actual working parameters
    const skin = skinColors[features.skinTone] || 'Light';
    const topColor = topColors[features.hairColor] || 'Brown';
    const top = tops[features.hairStyle] || 'ShortHairShortFlat';
    const accessories = features.hasGlasses ? 'Prescription02' : '';
    const clothe = isBoy ? 'Hoodie' : 'Overall';
    
    const seed = `${features.gender}${features.skinTone}${features.hairColor}`;
    
    let url = `${baseUrl}/${encodeURIComponent(seed)}.svg?`;
    url += `skinColor=${skin}`;
    url += `&topType=${top}`;
    url += `&hairColor=${topColor}`;
    url += `&accessoriesType=${accessories}`;
    url += `&clotheType=${clothe}`;
    url += `&eyeType=Default`;
    url += `&eyebrowType=Default`;
    url += `&mouthType=Smile`;
    url += `&facialHairType=Blank`;
    
    console.log('🎨 Avatar URL:', url);
    return url;
  }, [features]);

  return (
    <div className={`${sizeClasses[size]} mx-auto flex-shrink-0`}>
      <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300 shadow-md overflow-hidden">
        <img 
          src={avatarUrl} 
          alt="Character Avatar"
          className="w-full h-full object-cover"
          onLoad={() => console.log('✅ Avatar loaded successfully!')}
          onError={(e) => {
            console.error('❌ Failed to load avatar');
            const svg = `data:image/svg+xml,${encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <rect fill="#e0f2fe" width="100" height="100"/>
                <text x="50" y="50" text-anchor="middle" font-size="40">👤</text>
              </svg>
            `)}`;
            (e.target as HTMLImageElement).src = svg;
          }}
        />
      </div>
    </div>
  );
}
