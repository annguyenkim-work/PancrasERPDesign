# Feature Specification: Tổng quan điều hành

**Feature Branch**: `002-tong-quan`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "Màn Tổng quan Điều hành trên demo: xem doanh thu theo hôm nay, tháng này, năm; xem đơn, công nợ, hàng dưới mức cảnh báo và tồn theo kho hoặc showroom; xuất bảng tồn."

## Clarifications

### Session 2026-11-06

- Q: Dư nợ đại lý và dư nợ nhà phân phối hiện tách hay gộp? → A: Tách hai số. Nhà phân phối là loại khách riêng.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Xem doanh thu theo kỳ (Priority: P1)

Nhân viên mở tổng quan và chọn một kỳ: hôm nay, tháng này, hoặc năm. Màn hình đổi số doanh thu và nhãn kỳ cho đúng lựa chọn vừa bấm.

**Why this priority**: Đây là việc đầu tiên khi mở màn điều hành.

**Independent Test**: Mở tổng quan, bấm lần lượt ba kỳ, mỗi lần thấy nhãn kỳ và một số doanh thu tương ứng.

**Acceptance Scenarios**:

1. **Given** tổng quan đang mở, **When** nhân viên chọn Hôm nay, **Then** màn hình ghi kỳ hôm nay và một số doanh thu của kỳ đó.
2. **Given** đang xem hôm nay, **When** nhân viên chọn Tháng này rồi Năm, **Then** nhãn kỳ và số doanh thu đổi theo từng lựa chọn.

---

### User Story 2 - Xem tình hình đơn, nợ và tồn (Priority: P2)

Nhân viên thấy số đơn, số đơn đang xử lý, số đơn hoàn tất, dư nợ đại lý, dư nợ nhà phân phối, dư nợ dự án, và phần nợ của khách đang bị khóa nợ. Nhân viên thấy mặt hàng có tồn không cao hơn mức cảnh báo của chính mặt hàng đó, và thấy tồn theo từng kho hoặc showroom.

**Why this priority**: Tổng quan dùng để phát hiện đơn tồn, nợ và hàng sắp thiếu.

**Independent Test**: Với dữ liệu có đơn, khách nợ và một mặt hàng dưới mức cảnh báo của mặt hàng đó, mở tổng quan và đọc được các số này.

**Acceptance Scenarios**:

1. **Given** có một đơn chờ duyệt và một đơn đã nghiệm thu, **When** nhân viên mở tổng quan, **Then** đơn chờ duyệt nằm trong số đang xử lý, đơn đã nghiệm thu nằm trong số hoàn tất, và tổng số đơn gồm cả hai.
2. **Given** có khách đại lý, khách nhà phân phối và khách dự án đang nợ, **When** nhân viên xem khối công nợ, **Then** thấy dư nợ đại lý, dư nợ nhà phân phối, dư nợ dự án và nợ của khách đang khóa nợ tách riêng.
3. **Given** một mặt hàng có tồn không cao hơn mức cảnh báo ghi trên mặt hàng đó, **When** nhân viên xem cảnh báo hàng, **Then** mặt hàng đó xuất hiện trong danh sách cảnh báo.
4. **Given** có nhiều kho và showroom, **When** nhân viên xem khối tồn, **Then** mỗi địa điểm có số lượng tồn và phần đang giữ cho đơn.

---

### User Story 3 - Xuất bảng tồn (Priority: P3)

Nhân viên xuất bảng các địa điểm đang thấy trên tổng quan. Tệp tải về có tên địa điểm, loại kho hoặc showroom, địa chỉ, số lượng tồn và phần đang giữ.

**Why this priority**: Bảng xuất phục vụ họp, sau khi đã xem được số trên màn hình.

**Independent Test**: Bấm xuất và mở tệp, thấy đủ các địa điểm đang có trên màn hình.

**Acceptance Scenarios**:

1. **Given** tổng quan đang hiện danh sách địa điểm, **When** nhân viên xuất bảng tồn, **Then** tệp tải về có một dòng cho mỗi địa điểm đang hiện.

---

### Edge Cases

- Không có đơn: các số đơn hiện 0, màn hình vẫn mở được.
- Không có mặt hàng dưới mức cảnh báo: danh sách cảnh báo trống, các khối khác vẫn hiện.
- Không có khách nợ: dư nợ hiện 0.
- Đổi kỳ doanh thu không làm đổi số tồn và số nợ.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Nhân viên MUST chọn được kỳ doanh thu hôm nay, tháng này, hoặc năm, và MUST thấy nhãn kỳ cùng một số doanh thu của kỳ đã chọn.
- **FR-002**: Tổng quan MUST hiện tổng số đơn, số đơn đang xử lý và số đơn hoàn tất. Đơn đang xử lý là đơn chờ duyệt, đang soạn xuất hoặc đang giao. Đơn hoàn tất là đơn đã nghiệm thu xong.
- **FR-003**: Tổng quan MUST hiện dư nợ đại lý, dư nợ nhà phân phối, dư nợ dự án và nợ của khách đang khóa nợ. Dư nợ nhà phân phối và dư nợ đại lý MUST là hai số.
- **FR-004**: Mặt hàng có tồn không cao hơn mức cảnh báo của chính mặt hàng đó MUST xuất hiện trong danh sách cảnh báo. Mức cảnh báo MUST lấy theo từng mặt hàng, không lấy một ngưỡng chung của dữ liệu mẫu.
- **FR-005**: Tổng quan MUST hiện từng kho và showroom với số lượng tồn và phần đang giữ cho đơn.
- **FR-006**: Nhân viên MUST xuất được bảng tồn của các địa điểm đang hiện.
- **FR-007**: Cách ghi doanh số MUST [NEEDS CLARIFICATION: ghi lúc duyệt đơn, lúc giao hàng, hay lúc thu tiền? Hàng trả có trừ doanh số không? Phần Chưa chốt chưa có câu trả lời.]

### Key Entities *(include if feature involves data)*

- **Kỳ doanh thu**: Hôm nay, tháng này, hoặc năm. Mỗi kỳ có một số doanh thu nhân viên nhìn thấy.
- **Địa điểm tồn**: Một kho hoặc showroom, với số lượng tồn và phần đang giữ.
- **Cảnh báo hàng**: Một mặt hàng mà tồn không cao hơn mức cảnh báo của mặt hàng đó.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Trong 3 lần đổi kỳ, 3/3 lần nhãn kỳ và số doanh thu đổi đúng lựa chọn vừa bấm.
- **SC-002**: Với một bộ dữ liệu có đơn, nợ và một mặt hàng dưới mức cảnh báo của mặt hàng đó, nhân viên đọc đủ bốn nhóm số (đơn, nợ, cảnh báo, tồn theo địa điểm) mà không cần mở màn khác.
- **SC-003**: 1/1 lần xuất bảng tồn có đủ số địa điểm đang hiện trên màn hình.

## Assumptions

- Người xem là nhân viên đã mở được màn tổng quan. Bảng quyền chỉ là đề xuất. Spec này không chọn vai trò nào được vào màn.
- Số liệu mẫu trên demo không phải doanh thu, hạn mức hay ngưỡng thật.
- Ngoài phạm vi của màn này: giá, chiết khấu, thuế, cách thu tiền, combo, nhập khẩu, bảo hành, phân quyền chi tiết.
- Thời điểm ghi doanh số được đánh dấu [NEEDS CLARIFICATION] ở FR-007 và chưa phải quy tắc.
- Quy tắc giữ hàng khi ghi nhận đơn bán nằm ở spec `001-reserve-sale-stock`. Tổng quan chỉ hiện phần đang giữ, không đổi quy tắc đó.
- Nhà phân phối là loại khách thứ tư, tách khỏi đại lý. Khối nợ của hai loại là hai số.
