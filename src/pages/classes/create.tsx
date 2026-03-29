import { useEffect, useRef } from "react";
import {CreateView} from "@/components/refine-ui/views/create-view.tsx";
import {Breadcrumb} from "@/components/refine-ui/layout/breadcrumb.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useBack} from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import {Separator} from "@/components/ui/separator.tsx";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx"
import { zodResolver } from "@hookform/resolvers/zod"
import {classSchema} from "@/lib/schema.ts";
import * as z from "zod";
import {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_UPLOAD_PRESET,
} from "@/constants";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Loader2} from "lucide-react";


const CLOUDINARY_WIDGET_SCRIPT =
    "https://upload-widget.cloudinary.com/latest/global/all.js";

const Create = () => {
    const back = useBack();
    const uploadWidgetRef = useRef<CloudinaryWidget | null>(null);

    const form = useForm({
        resolver: zodResolver(classSchema),
        refineCoreProps: {
            resource: "classes",
            action: "create",
            redirect: "list",
            successNotification: () => ({
                type: "success",
                message: "Class created successfully",
            }),
            errorNotification: (error) => ({
                type: "error",
                message: "Could not create class",
                description:
                    error?.message ??
                    "Something went wrong. Please try again.",
            }),
        },
        defaultValues: {
            status: "active",
            name: "",
            description: "",
            teacherId: "",
            bannerUrl: "",
            bannerCldPubId: "",
        },
    });

    const {
        handleSubmit,
        formState: { isSubmitting },
        control,
        setValue,
        watch,
        refineCore: { onFinish },
    } = form;

    const bannerPreviewUrl = watch("bannerUrl");

    useEffect(() => {
        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
            return;
        }

        let cancelled = false;

        const ensureScript = () =>
            new Promise<void>((resolve, reject) => {
                if (window.cloudinary) {
                    resolve();
                    return;
                }
                const existing = document.querySelector<HTMLScriptElement>(
                    `script[src="${CLOUDINARY_WIDGET_SCRIPT}"]`
                );
                if (existing) {
                    if (window.cloudinary) {
                        resolve();
                        return;
                    }
                    existing.addEventListener("load", () => resolve(), {
                        once: true,
                    });
                    existing.addEventListener(
                        "error",
                        () => reject(new Error("Cloudinary script failed")),
                        { once: true }
                    );
                    return;
                }
                const script = document.createElement("script");
                script.src = CLOUDINARY_WIDGET_SCRIPT;
                script.async = true;
                script.onload = () => resolve();
                script.onerror = () =>
                    reject(new Error("Cloudinary script failed"));
                document.body.appendChild(script);
            });

        ensureScript()
            .then(() => {
                if (cancelled || !window.cloudinary || uploadWidgetRef.current) {
                    return;
                }
                uploadWidgetRef.current = window.cloudinary.createUploadWidget(
                    {
                        cloudName: CLOUDINARY_CLOUD_NAME,
                        uploadPreset: CLOUDINARY_UPLOAD_PRESET,
                        multiple: false,
                        resourceType: "image",
                    },
                    (error, result) => {
                        if (error) {
                            console.error(error);
                            return;
                        }
                        if (result?.event === "success" && result.info) {
                            setValue("bannerUrl", result.info.secure_url, {
                                shouldValidate: true,
                                shouldDirty: true,
                            });
                            setValue("bannerCldPubId", result.info.public_id, {
                                shouldValidate: true,
                                shouldDirty: true,
                            });
                        }
                    }
                );
            })
            .catch((err) => console.error(err));

        return () => {
            cancelled = true;
        };
    }, [setValue]);

    const onSubmit = async (values: z.infer<typeof classSchema>) => {
        try {
            await onFinish(values);
        } catch (error) {
            console.error("Error creating class:", error);
        }
    };

    const openBannerUpload = () => {
        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
            console.warn(
                "Cloudinary is not configured (cloud name / upload preset)."
            );
            return;
        }
        uploadWidgetRef.current?.open();
    };

    const cloudinaryConfigured =
        Boolean(CLOUDINARY_CLOUD_NAME) && Boolean(CLOUDINARY_UPLOAD_PRESET);

    const teachers = [
        {
            id: 1,
            name: "John Doe",
        },
        {
            id: 2,
            name: "Jane Doe",
        },
    ];

    const subjects = [
        {
            id: 1,
            name: "Math",
            code: "MATH",
        },
        {
            id: 2,
            name: "English",
            code: "ENG",
        },
    ];

    return (
        <CreateView className="class-view">
            <Breadcrumb />

            <h1 className="page-title">Create a Class</h1>
            <div className="intro-row">
                <p>Provide the required information below to add a class.</p>
                <Button onClick={() => back()}>Go Back</Button>
            </div>

            <Separator />

            <div className="my-4 flex items-center">
                <Card className="class-form-card">
                    <CardHeader className="relative z-10">
                        <CardTitle className="text-2xl pb-0 font-bold text-gradient-orange">
                            Fill out form
                        </CardTitle>
                    </CardHeader>

                    <Separator />

                    <CardContent className="mt-7">
                        <Form {...form}>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div className="space-y-3">
                                    <FormField
                                        control={control}
                                        name="bannerUrl"
                                        render={() => (
                                            <FormItem>
                                                <FormLabel>
                                                    Banner Image{" "}
                                                    <span className="text-orange-600">
                                                        *
                                                    </span>
                                                </FormLabel>
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        disabled={!cloudinaryConfigured}
                                                        onClick={openBannerUpload}
                                                    >
                                                        Upload banner
                                                    </Button>
                                                    {!cloudinaryConfigured && (
                                                        <FormDescription>
                                                            Set{" "}
                                                            <code className="text-xs">
                                                                VITE_CLOUDINARY_CLOUD_NAME
                                                            </code>{" "}
                                                            and{" "}
                                                            <code className="text-xs">
                                                                VITE_CLOUDINARY_UPLOAD_PRESET
                                                            </code>{" "}
                                                            to enable uploads.
                                                        </FormDescription>
                                                    )}
                                                </div>
                                                {bannerPreviewUrl ? (
                                                    <div className="upload-preview mt-2 overflow-hidden rounded-md border border-border">
                                                        <img
                                                            src={bannerPreviewUrl}
                                                            alt="Class banner preview"
                                                            className="max-h-40 w-full object-cover"
                                                        />
                                                    </div>
                                                ) : null}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name="bannerCldPubId"
                                        render={() => (
                                            <FormItem className="space-y-0">
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Class Name <span className="text-orange-600">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Introduction to Biology - Section A"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={control}
                                        name="subjectId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Subject <span className="text-orange-600">*</span>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={(value) =>
                                                        field.onChange(Number(value))
                                                    }
                                                    value={field.value?.toString()}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select a subject" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {subjects.map((subject) => (
                                                            <SelectItem
                                                                key={subject.id}
                                                                value={subject.id.toString()}
                                                            >
                                                                {subject.name} ({subject.code})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={control}
                                        name="teacherId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Teacher <span className="text-orange-600">*</span>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select a teacher" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {teachers.map((teacher) => (
                                                            <SelectItem
                                                                key={teacher.id}
                                                                value={teacher.id.toString()}
                                                            >
                                                                {teacher.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={control}
                                        name="capacity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Capacity</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="30"
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            field.onChange(value ? Number(value) : undefined);
                                                        }}
                                                        value={(field.value as number | undefined) ?? ""}
                                                        name={field.name}
                                                        ref={field.ref}
                                                        onBlur={field.onBlur}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Status <span className="text-orange-600">*</span>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="active">Active</SelectItem>
                                                        <SelectItem value="inactive">Inactive</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Brief description about the class"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator />

                                <Button type="submit" size="lg" className="w-full">
                                    {isSubmitting ? (
                                        <div className="flex gap-1">
                                            <span>Creating Class...</span>
                                            <Loader2 className="inline-block ml-2 animate-spin" />
                                        </div>
                                    ) : (
                                        "Create Class"
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </CreateView>
    );
};

export default Create;
