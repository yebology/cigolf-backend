export interface User {
  username: string;
  password: string;
  role: Role;
  name: string;
  phoneNumber: string;
}

enum Role {
  Mandor = "mandor",
  Supervisor = "supervisor",
}
