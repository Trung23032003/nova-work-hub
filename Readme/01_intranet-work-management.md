\# Đặc tả tính năng trang web nội bộ quản lý công việc



Trang web nội bộ này phục vụ quản lý dự án, công việc và trao đổi thông tin cho công ty công nghệ chuyên làm website cho khách hàng. Mục tiêu là tập trung hóa thông tin, giảm lệ thuộc vào tool rời rạc và tăng khả năng theo dõi tiến độ, chất lượng.



---



\## 1. Đối tượng sử dụng và vai trò



\### 1.1. Nhóm người dùng chính



\- Ban lãnh đạo (CEO, Director): xem tổng quan tiến độ, tải công việc, hiệu suất team. 

\- PM/Leader: tạo và quản lý dự án, phân task, theo dõi tiến độ, review kết quả.

\- Developer/Designer/QA: nhận việc, cập nhật trạng thái, log thời gian, trao đổi trong phạm vi task.

\- Bộ phận hỗ trợ khác (Sale, BA, CSKH): cung cấp yêu cầu, spec, theo dõi trạng thái triển khai.



\### 1.2. Vai trò và quyền cơ bản



\- Admin: quản lý toàn hệ thống, user, phân quyền, cấu hình chung.

\- PM/Leader: tạo/sửa dự án, task trong dự án mình phụ trách, xem báo cáo liên quan team. 

\- Member: xem task được giao, cập nhật trạng thái, comment, upload file, log time.

\- Viewer (nếu cần): chỉ xem được một số dự án, báo cáo hoặc module được phân quyền.



---



\## 2. Dashboard tổng quan



\### 2.1. Mục tiêu



\- Cung cấp cái nhìn nhanh về tình trạng công việc và dự án cho từng user khi đăng nhập.

\- Giúp lãnh đạo và PM nắm được các điểm nghẽn, dự án rủi ro, workload của team.



\### 2.2. Thành phần chính



\- Widget “Dự án đang chạy”: danh sách/biểu đồ dự án theo trạng thái (Planning, In progress, Review, Done). 

\- Danh sách task quan trọng sắp đến hạn và đã quá hạn của user hiện tại.   

\- Thống kê nhanh: số task hôm nay, tuần này, % hoàn thành theo dự án, cảnh báo task trễ.   

\- Workload theo người: biểu đồ số task/giờ log theo từng member trong team (chỉ với PM/Admin).   



---



\## 3. Quản lý dự án (Project)



\### 3.1. Thông tin dự án



Mỗi dự án cần các trường cơ bản: 



\- Tên dự án  

\- Mã dự án (code)  

\- Khách hàng (liên kết tới CRM nếu có)  

\- Mô tả ngắn  

\- Trạng thái: Planning / In progress / On hold / Done / Canceled  

\- Ngày bắt đầu, dự kiến kết thúc, ngày kết thúc thực tế  

\- PM phụ trách, team tham gia (Frontend, Backend, Design, QA, BA, v.v.)  

\- Loại dự án: làm mới website, bảo trì, nâng cấp tính năng, retainer, v.v.  

\- Chi phí dự án.



\### 3.2. Chức năng chính



\- Tạo/sửa/xóa dự án, archive dự án đã hoàn thành.   

\- Gán user vào dự án với vai trò (PM, Dev, Designer, QA, Viewer).

\- Xem timeline dự án: mốc chính (milestone), % hoàn thành theo task.   

\- Gắn nhãn (tag) cho dự án: theo khách hàng, độ ưu tiên.



---



\## 4. Quản lý công việc (Task)



\### 4.1. Thông tin task



Mỗi task nên có:



\- Tiêu đề task  

\- Mô tả chi tiết (acceptance criteria, link spec, design)  

\- Thuộc dự án nào  

\- Người được assign chính, có thể có người liên quan (watcher)  

\- Trạng thái: To do / In progress / Review / Reopen / Done  

\- Độ ưu tiên: Low / Medium / High / Critical  

\- Deadline, ngày bắt đầu, thời gian ước lượng (estimate)

\- Tổng số giờ làm, giờ tăng ca(OT ngày thường x1.5 lương, ngày nghỉ x2, ngày lễ x3) 

\- Loại task: Dev, Design, QA, Meeting, Research, Bug, v.v.  

\- Checklist con (subtasks)  

\- File đính kèm (spec, design, hình ảnh, video demo)  



\### 4.2. Chức năng task



\- Tạo/sửa/xóa task trong phạm vi dự án được phép.   

\- Gán/đổi người phụ trách task, thay đổi trạng thái kéo-thả trên Kanban.   

\- Bình luận theo thread trong mỗi task, hỗ trợ mention (@username) và notify.

\- Log time cho từng task: số giờ thực tế, ghi chú công việc đã làm.   

\- Lịch sử thay đổi (activity log): ai đổi trạng thái, đổi assignee, đổi deadline, v.v.



---



\## 5. Các chế độ hiển thị công việc



\### 5.1. Kanban Board



\- Bảng cột theo trạng thái (To do, In progress, Review, Done) cho từng dự án.   

\- Hỗ trợ kéo-thả card task giữa các cột và cập nhật trạng thái tự động.   



\### 5.2. List View



\- Dạng bảng: cho phép filter theo dự án, assignee, trạng thái, deadline, priority.   

\- Hỗ trợ sort theo deadline, ngày tạo, độ ưu tiên.   



\### 5.3. Calendar View



\- Hiển thị task trên lịch theo deadline hoặc start date.

\- Cho phép drag \& drop để thay đổi deadline nhanh.   



---



\## 6. Người dùng, phòng ban và quyền



\### 6.1. Quản lý user



\- Tạo user, import từ file hoặc đồng bộ với hệ thống HR nếu có.

\- Thông tin: tên, email công ty, vị trí, phòng ban, kỹ năng chính, avatar.

\- Trạng thái tài khoản: active, inactive, locked. 



\### 6.2. Cấu trúc phòng ban/team



\- Khai báo phòng ban: Dev, Design, QA, Sale, BA, CSKH, v.v.

\- Gán user vào một hoặc nhiều team (ví dụ Dev + DevOps).

\- Cho phép filter task/dự án theo phòng ban và team.   



\### 6.3. Phân quyền chi tiết



\- Role-based access control (RBAC) cho các nhóm quyền: Admin, PM, Member, Viewer.  

\- Quy định chi tiết: ai được tạo/sửa/xóa dự án, task; ai xem được báo cáo toàn công ty hoặc chỉ team.



---



\## 7. Giao tiếp và cộng tác nội bộ



\### 7.1. Bình luận và thông báo



\- Comment trong từng task/dự án, mention user, đính kèm file, chèn link.

\- Thông báo realtime (web + email hoặc chat) khi được assign task, bị mention, deadline sắp đến.



\### 7.2. Tích hợp công cụ chat



\- Link nhanh đến các kênh Slack/Teams/Zalo tương ứng với từng dự án.

\- (Tuỳ chọn) Tích hợp API để gửi notification sang các kênh chat.



---



\## 8. Kho tài liệu \& knowledge base



\### 8.1. Kho tài liệu dự án



\- Lưu trữ spec, tài liệu phân tích, tài liệu test, biên bản họp, file thiết kế.

\- Folder/space theo từng dự án, phân quyền xem/sửa theo team. 



\### 8.2. Knowledge base nội bộ



\- Lưu guideline coding, best practice, checklist release, quy trình onboard, FAQ.

\- Hỗ trợ search theo từ khóa, tag, loại tài liệu; có version control cho tài liệu quan trọng.



---



\## 9. Lịch, time tracking và biểu mẫu



\### 9.1. Lịch dự án \& lịch cá nhân



\- View lịch theo user hoặc theo dự án (deadline, milestone, cuộc họp quan trọng).   

\- Đồng bộ một chiều hoặc hai chiều với Google Calendar/Microsoft 365 (nếu cần).   



\### 9.2. Time tracking



\- Log thời gian làm việc theo task/dự án, ghi chú nội dung công việc.   

\- Báo cáo giờ làm theo người, theo dự án, theo loại công việc (Dev, QA, Meeting…).   



\### 9.3. Biểu mẫu nội bộ (Forms)



\- Tạo form xin nghỉ, đề xuất thiết bị, góp ý, báo bug nội bộ. 

\- Mỗi form có quy trình phê duyệt (approve/reject) và phân quyền xem.  



---



\## 10. Báo cáo và phân tích



\### 10.1. Báo cáo công việc



\- Số lượng task tạo mới, hoàn thành, quá hạn theo ngày/tuần/tháng.   

\- Thống kê theo trạng thái task và loại task để nhận diện tắc nghẽn (ví dụ nhiều bug ở giai đoạn release).   



\### 10.2. Báo cáo dự án



\- Tiến độ từng dự án (% task done, thời gian còn lại so với deadline).   

\- So sánh estimate vs actual time theo dự án để đánh giá độ chính xác khi ước lượng.   



\### 10.3. Báo cáo nhân sự



\- Workload theo người: số task đang xử lý, giờ log, overtime (nếu có).   

\- Hiệu suất cá nhân theo giai đoạn (số task hoàn thành, tỷ lệ task trễ).   



---



\## 11. Yêu cầu phi chức năng



\### 11.1. Hiệu năng và trải nghiệm



\- Giao diện responsive, dùng tốt trên laptop và mobile.

\- Thời gian tải trang hợp lý, ưu tiên UX đơn giản, tập trung vào thao tác nhanh cho PM và dev.



\### 11.2. Bảo mật và phân quyền



\- Đăng nhập bảo mật (nội bộ, SSO hoặc tích hợp hệ thống hiện có).

\- Mã hóa dữ liệu nhạy cảm, backup định kỳ, log truy cập.



\### 11.3. Khả năng mở rộng



\- Thiết kế theo hướng module để dễ bổ sung các tính năng mới (CRM, HR, billing, v.v.).

\- API để tích hợp với các hệ thống khác (chat, kế toán, CI/CD, v.v.).



---



\## 12. Gợi ý tổ chức sitemap



\- `/dashboard` – Tổng quan cho từng user.   

\- `/projects` – Danh sách dự án, tạo và quản lý dự án.   

\- `/projects/{id}` – Chi tiết dự án, tab Task, Files, Members, Activity.   

\- `/tasks` – Danh sách task theo filter toàn hệ thống.   

\- `/calendar` – Lịch công việc và dự án.   

\- `/reports` – Báo cáo tổng hợp, dự án, nhân sự.   

\- `/knowledge-base` – Kho tài liệu và guideline. \[web:11]  

\- `/forms` – Các biểu mẫu nội bộ. \[web:11]  

\- `/admin` – Quản lý user, vai trò, phòng ban, cấu hình hệ thống. \[web:11]\[web:35]  



