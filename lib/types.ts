

export interface ISignUpData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  code: string;
}

export interface ISLoginData{
  email: string;
  password: string;
  code: string;
}

export interface ISFrorgotData{
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
}

export interface ISCommentData{
  comment: string;
  vote: boolean | null;
  game_id: number;
  slug: string;
}