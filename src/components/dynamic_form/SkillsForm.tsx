import React from 'react';
import {
    useForm,
    useFieldArray,
    Controller,
    SubmitHandler
} from 'react-hook-form';
import {
    TextField,
    Button,
    IconButton,
    Stack,
    Typography,
    Paper,
    Box,
    MenuItem,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import DeleteIcon from '@mui/icons-material/Delete';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AddIcon from '@mui/icons-material/Add';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface ISkill {
    name: string;
    level: string;
}

interface IFormInput {
    fullName: string;
    skills: ISkill[];
}

const schema = yup.object().shape({
    fullName: yup.string().required("Tên không được để trống"),
    skills: yup.array().of(
        yup.object().shape({
            name: yup.string().required("Nhập tên kĩ năng"),
            level: yup.string().required("Nhập trình độ")
        })
    ).min(1, "Phải có ít nhất một kĩ năng").required()
});

const DynamicForm = () => {

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<IFormInput>({
        resolver: yupResolver(schema),
        defaultValues: {
            fullName: "",
            skills: [{ name: "", level: "beginner" }]
        },
        mode: "onChange"
    });


    const { fields, append, remove } = useFieldArray({
        control,    // Phải truyền control từ useForm vào đây để kết nối
        name: "skills" // Tên của mảng trong IFormInput
    });

    // Hàm xử lý khi Submit thành công
    const onSubmit: SubmitHandler<IFormInput> = (data) => {
        console.log("Dữ liệu Form:", data);
    };

    return (
        <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                    Hồ Sơ Năng Lực
                </Typography>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={4}>
                        {/* INPUT TÊN NGƯỜI DÙNG */}
                        <Controller
                            name="fullName"
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                                <TextField
                                    {...field}
                                    label="Họ và Tên"
                                    fullWidth
                                    error={!!error}
                                    helperText={error?.message}
                                />
                            )}
                        />

                        <Typography variant="h6">Danh sách kỹ năng</Typography>

                        {/* DANH SÁCH INPUT ĐỘNG */}
                        {fields.map((item, index) => (
                            <Grid container spacing={2} key={item.id} alignItems="flex-start" direction={'row'}>
                                {/* LƯU Ý QUAN TRỌNG: key={item.id} là bắt buộc để RHF quản lý đúng các dòng khi thêm/xóa.*/}

                                <Grid size={{ xs: 5 }}>
                                    <Controller
                                        name={`skills.${index}.name` as const} // 'as const' giúp TS hiểu đúng đường dẫn mảng
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label={`Kỹ năng #${index + 1}`}
                                                fullWidth
                                                error={!!errors.skills?.[index]?.name}
                                                helperText={errors.skills?.[index]?.name?.message}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{ xs: 5 }}>
                                    <Controller
                                        name={`skills.${index}.level` as const}
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Trình độ"
                                                select
                                                fullWidth
                                                error={!!errors.skills?.[index]?.level}
                                                helperText={errors.skills?.[index]?.level?.message}
                                            >
                                                <MenuItem value="beginner">Sơ cấp</MenuItem>
                                                <MenuItem value="intermediate">Trung cấp</MenuItem>
                                                <MenuItem value="advanced">Cao cấp</MenuItem>
                                            </TextField>
                                        )}
                                    />
                                </Grid>

                                <Grid size={{ xs: 2 }}>
                                    {/* Nút xóa dòng - chỉ hiện nếu có nhiều hơn 1 dòng (tùy chọn) */}
                                    <IconButton
                                        color="error"
                                        onClick={() => remove(index)}
                                        disabled={fields.length <= 1}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        ))}

                        {/* NÚT THÊM DÒNG */}
                        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={() => append({ name: "", level: "beginner" })}
                                sx={{ alignSelf: 'flex-start' }}
                            >
                                Thêm kỹ năng
                            </Button>

                            <Button
                                type="button"
                                variant="outlined"
                                startIcon={<RestartAltIcon />}
                                onClick={() => reset()}
                                sx={{ alignSelf: 'flex-end' }}
                            >
                                Reset Form
                            </Button>
                        </Stack>

                        <Button type="submit" variant="contained" size="large">
                            Lưu thông tin
                        </Button>
                    </Stack>
                </form>
            </Paper>
        </Box>
    );
};

export default DynamicForm;