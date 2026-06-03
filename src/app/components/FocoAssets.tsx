/* Logo assets — synced from Figma */
import focoLogoSrc from '../../assets/foco-logo.png';
import focoProfileAvatarSrc from '../../assets/foco-avatar-profile.png';
import focoAvatarBtnSrc from '../../assets/foco-avatar-btn.png';

export function FocoOwlLogo({ size = 64 }: { size?: number }) {
  return (
    <img
      src={focoLogoSrc}
      width={size}
      height={size}
      alt="FOCO"
      style={{ display: 'block', borderRadius: '50%' }}
    />
  );
}

export function FocoOwlAvatar({ size = 32 }: { size?: number }) {
  return (
    <img
      src={focoLogoSrc}
      width={size}
      height={size}
      alt="FOCO"
      style={{ display: 'block', borderRadius: '50%' }}
    />
  );
}

/** 首页及各页左上角头像按钮 · 同步 Figma `604:9` / `733:9` · 头像 · 吉祥物 */
export function FocoAvatarButtonImage({ size = 44 }: { size?: number }) {
  return (
    <img
      src={focoAvatarBtnSrc}
      width={size}
      height={size}
      alt="FOCO"
      style={{ display: 'block' }}
    />
  );
}

/** 「我的」个人信息卡大头像 · 同步 Figma `1331:1599` / `1353:1622` */
export function FocoProfileAvatar({ size = 64 }: { size?: number }) {
  return (
    <img
      src={focoProfileAvatarSrc}
      width={size}
      height={size}
      alt=""
      role="presentation"
      style={{ display: 'block', borderRadius: '50%', objectFit: 'cover' }}
    />
  );
}

export function FocoOwlQuestion({ size = 32 }: { size?: number }) {
  return <FocoOwlAvatar size={size} />;
}

export function FocoOwlPeek() {
  return (
    <svg
      width="160"
      height="200"
      viewBox="0 0 160 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* body */}
      <ellipse cx="80" cy="160" rx="60" ry="60" fill="#003459" />
      {/* ear tufts */}
      <polygon points="46,90 56,114 36,114" fill="#00496b" />
      <polygon points="114,90 124,114 104,114" fill="#00496b" />
      {/* face */}
      <ellipse cx="80" cy="148" rx="44" ry="38" fill="#f0ece4" />
      {/* eye rings */}
      <circle cx="62" cy="144" r="16" fill="white" />
      <circle cx="98" cy="144" r="16" fill="white" />
      {/* pupils */}
      <circle cx="62" cy="144" r="10" fill="#003459" />
      <circle cx="98" cy="144" r="10" fill="#003459" />
      {/* eye highlights */}
      <circle cx="57" cy="139" r="3" fill="white" />
      <circle cx="93" cy="139" r="3" fill="white" />
      {/* beak */}
      <path d="M 72 158 L 80 170 L 88 158 Z" fill="#E8A020" />
      {/* hands peeking over edge */}
      <ellipse cx="30" cy="190" rx="20" ry="12" fill="#003459" />
      <ellipse cx="130" cy="190" rx="20" ry="12" fill="#003459" />
    </svg>
  );
}
